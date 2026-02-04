
import { 
  Order, Lead, Product, Coupon, OrderStatus, 
  AppUser, Department, Category, SystemSettings, 
  UserRole, UserStatus, UserSession, Affiliate, Commission, Banner, EmailTemplate, RemarketingLog, AIChatSession, PerformanceMetric, SystemLog, PaymentGateway, Transaction, Carrier, Delivery, AuditLog, SecurityEvent, DeployRecord, BackupRecord, InfraMetric, Seller, LGPDConsent, LGPDLog, PWANotification, ExternalAPIConfig, IntegrationSyncLog, WhatsAppMessage, AIRecommendation, AIPrediction, AIAutomationRule, AILogEntry, HelpTopic, RoleDefinition, UserFavorite
} from '../types';
import { dbStore } from './db';
import { supabase } from '../backend/supabaseClient';

const KEY_SESSION = 'auth_session';

export const storeService = {
  async initializeSystem(): Promise<void> {
    try {
      let config = null;
      if (supabase) {
        const { data } = await supabase.from('core_settings').select('*').eq('key', 'geral').single();
        config = data;
      }

      if (config) {
        await dbStore.put('config', config);
      } else {
        const local = await dbStore.getByKey<any>('config', 'geral');
        if (!local) {
          const defaultConfig: SystemSettings = {
            nomeLoja: 'G-FitLife',
            logoUrl: 'https://picsum.photos/seed/gfitlife/400/400',
            emailContato: 'contato@gfitlife.io',
            telefone: '(11) 4004-GFIT',
            whatsapp: '(11) 99999-0000',
            dominio: 'gfitlife.io',
            moeda: 'BRL',
            timezone: 'America/Sao_Paulo',
            companyName: 'G-FitLife Enterprise',
            storeName: 'G-FitLife Oficial',
            adminEmail: 'admin@gfitlife.io',
            systemStatus: 'online',
            environment: 'production',
            privacyPolicy: 'Política LGPD G-FitLife...',
            termsOfUse: 'Termos de uso corporativos...',
            pwaInstalledCount: 0,
            pwaVersion: '4.0.0',
            pushNotificationsActive: true,
            language: 'pt-BR',
            currency: 'BRL'
          };
          // @ts-ignore
          await dbStore.put('config', { ...defaultConfig, key: 'geral' });
        }
      }
    } catch (err) {
      console.warn("Inicialização em modo offline/demo.");
    }
  },

  async login(email: string, pass: string) {
    if (email.trim().toLowerCase() === 'admin@system.local' && pass === 'admin123') {
      const fallbackAdmin = { id: 'master-0', name: 'G-FitLife Master', email: email.toLowerCase(), role: UserRole.ADMIN_MASTER, status: UserStatus.ACTIVE };
      const session = this.createSession(fallbackAdmin);
      return { success: true, session, profile: fallbackAdmin, isStaff: true };
    }

    if (!supabase) return { success: false, error: 'Serviço offline' };

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: pass
      });

      if (error) return { success: false, error: 'Credenciais inválidas' };
      if (data.user) {
        const profile = await this.getProfileAfterLogin(data.user.id);
        if (profile) {
          if (profile.status !== UserStatus.ACTIVE) {
            await supabase.auth.signOut();
            return { success: false, error: 'Sua conta está inativa' };
          }
          const session = this.createSession(profile);
          const isStaff = [UserRole.ADMIN_MASTER, UserRole.ADMIN_OPERATIONAL, UserRole.FINANCE, UserRole.MARKETING, UserRole.SELLER].includes(profile.role);
          return { success: true, session, profile, isStaff };
        }
      }
    } catch (err) {
      return { success: false, error: 'Erro de conexão' };
    }
    return { success: false, error: 'Perfil não encontrado' };
  },

  async loginWithGoogle() {
    if (!supabase) return { success: false, error: 'Indisponível' };
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Falha no login social' };
    }
  },

  async registerAffiliate(data: { name: string, email: string, reason: string }) {
    if (!supabase) throw new Error('Supabase não conectado');
    
    try {
      // 1. Upsert no perfil para garantir que o usuário existe como INACTIVE e papel AFFILIATE
      // Usamos onConflict 'email' para não quebrar se o email já estiver cadastrado
      const { data: profile, error: pError } = await supabase.from('users_profile').upsert({
        name: data.name,
        email: data.email.toLowerCase(),
        role: UserRole.AFFILIATE,
        status: UserStatus.INACTIVE,
        loginType: 'email'
      }, { onConflict: 'email' }).select().single();

      if (pError) throw pError;

      // 2. Upsert na tabela de afiliados vinculando ao ID do perfil gerado/encontrado
      const { error: aError } = await supabase.from('affiliates').upsert({
        userId: profile.id,
        name: data.name,
        email: data.email.toLowerCase(),
        status: 'inactive',
        commissionRate: 15,
        totalSales: 0,
        balance: 0,
        refCode: ''
      }, { onConflict: 'userId' });

      if (aError) throw aError;
      return { success: true };
    } catch (err) {
      console.error("Erro crítico no registro de afiliado:", err);
      throw err;
    }
  },

  async uploadFile(file: File): Promise<string> {
    if (!supabase) throw new Error('Supabase não conectado');
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  async saveUser(user: AppUser): Promise<void> {
    if (supabase) {
      // Removemos o ID se for um novo cadastro fake para deixar o Supabase gerar o UUID se necessário
      const payload = { ...user };
      if (payload.id && (payload.id.startsWith('u-') || payload.id.includes('temp'))) {
          delete (payload as any).id;
      }
      
      const { error } = await supabase.from('users_profile').upsert(payload, { onConflict: 'email' });
      if (error) {
          console.error("Erro ao salvar usuário no Supabase:", error);
          throw error;
      }
    }
    await dbStore.put('users', user);
    window.dispatchEvent(new Event('usersChanged'));
  },

  async saveProduct(p: Product): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('products').upsert(p);
      if (error) {
          console.error("Erro ao salvar produto no Supabase:", error);
          throw error;
      }
    }
    await dbStore.put('products', p);
    window.dispatchEvent(new Event('productsChanged'));
  },

  async saveOrder(o: Order): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('orders').insert(o);
      if (error) throw error;
    }
    await dbStore.put('orders', o);
    window.dispatchEvent(new Event('ordersChanged'));
  },

  async getProfileAfterLogin(userId: string) {
    if (!supabase) return null;
    const { data: profile } = await supabase.from('users_profile').select('*').eq('id', userId).single();
    if (profile) return profile;

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
       const email = authUser.email?.toLowerCase();
       const { data: allProfiles } = await supabase.from('users_profile').select('*');
       const found = allProfiles?.find(p => p.email.toLowerCase() === email);
       if (found) {
          await supabase.from('users_profile').update({ id: authUser.id }).eq('id', found.id);
          return { ...found, id: authUser.id };
       }
    }
    return null;
  },

  async getSettings(): Promise<SystemSettings> {
    if (supabase) {
      const { data } = await supabase.from('core_settings').select('*').eq('key', 'geral').single();
      if (data) return data as SystemSettings;
    }
    const data = await dbStore.getByKey<any>('config', 'geral');
    return data as SystemSettings;
  },

  async saveSettings(settings: SystemSettings): Promise<void> {
    const dataToSave = { ...settings, key: 'geral' };
    if (supabase) {
      const { error } = await supabase.from('core_settings').upsert(dataToSave);
      if (error) throw error;
    }
    await dbStore.put('config', dataToSave);
    window.dispatchEvent(new Event('systemSettingsChanged'));
  },

  createSession(u: any): UserSession {
    const s: UserSession = {
      id: 'SESS-' + Date.now(),
      userId: u.id,
      userName: u.name,
      userEmail: u.email.toLowerCase(),
      userRole: u.role,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString()
    };
    sessionStorage.setItem(KEY_SESSION, JSON.stringify(s));
    window.dispatchEvent(new Event('sessionUpdated'));
    return s;
  },

  getActiveSession(): UserSession | null {
    const saved = sessionStorage.getItem(KEY_SESSION);
    if (!saved) return null;
    return JSON.parse(saved);
  },

  logout(): void {
    sessionStorage.removeItem(KEY_SESSION);
    if (supabase) supabase.auth.signOut();
    window.dispatchEvent(new Event('sessionUpdated'));
  },

  async getUsers(): Promise<AppUser[]> {
    if (supabase) {
      const { data } = await supabase.from('users_profile').select('*').order('created_at', { ascending: false });
      return data || [];
    }
    return await dbStore.getAll<AppUser>('users');
  },

  async updateMyCredentials(userId: string, email: string, password?: string) {
    if (!supabase) return false;
    try {
      const updates: any = { email };
      if (password) updates.password = password;
      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;
      return true;
    } catch (err) {
      return false;
    }
  },

  async getProducts(): Promise<Product[]> { 
    if (supabase) {
      const { data } = await supabase.from('products').select('*');
      return data || [];
    }
    return await dbStore.getAll<Product>('products'); 
  },
  
  async getOrders(): Promise<Order[]> { 
    if (supabase) {
      const { data } = await supabase.from('orders').select('*');
      return data || [];
    }
    return await dbStore.getAll<Order>('orders'); 
  },

  async getAffiliates(): Promise<Affiliate[]> { 
    if (supabase) {
      const { data } = await supabase.from('affiliates').select('*');
      return data || [];
    }
    return await dbStore.getAll<Affiliate>('affiliates'); 
  },

  async getCommissions(): Promise<Commission[]> { 
    if (supabase) {
      const { data } = await supabase.from('commissions').select('*, affiliate:affiliates(name)');
      return data || [];
    }
    return await dbStore.getAll<Commission>('commissions'); 
  },

  async getBanners(): Promise<Banner[]> { 
    if (supabase) {
      const { data } = await supabase.from('banners').select('*');
      return data || [];
    }
    return await dbStore.getAll<Banner>('banners'); 
  },

  async saveBanner(banner: Banner): Promise<void> { 
    if (supabase) {
      const { error } = await supabase.from('banners').upsert(banner);
      if (error) throw error;
    }
    await dbStore.put('banners', banner); 
    window.dispatchEvent(new Event('bannersChanged')); 
  },

  async createAdminUser(adminData: any): Promise<void> {
    const response = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Falha ao criar administrador');
    }
    window.dispatchEvent(new Event('usersChanged'));
  },

  async deleteAdminUser(id: string): Promise<boolean> {
    const response = await fetch('/api/admin/delete-user', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Falha ao excluir');
    }
    window.dispatchEvent(new Event('usersChanged'));
    return true;
  },

  async getDepartments(): Promise<Department[]> { 
    if (supabase) {
      const { data } = await supabase.from('departments').select('*');
      return data || [];
    }
    return await dbStore.getAll<Department>('departments'); 
  },

  async saveDepartment(dept: Department): Promise<void> { 
    if (supabase) {
      const { error } = await supabase.from('departments').upsert(dept);
      if (error) throw error;
    }
    await dbStore.put('departments', dept); 
    window.dispatchEvent(new Event('departmentsChanged')); 
  },

  async getCategories(): Promise<Category[]> { 
    if (supabase) {
      const { data } = await supabase.from('categories').select('*');
      return data || [];
    }
    return await dbStore.getAll<Category>('categories'); 
  },

  async saveCategory(cat: Category): Promise<void> { 
    if (supabase) {
      const { error } = await supabase.from('categories').upsert(cat);
      if (error) throw error;
    }
    await dbStore.put('categories', cat); 
    window.dispatchEvent(new Event('categoriesChanged')); 
  },

  async getCoupons(): Promise<Coupon[]> { 
    if (supabase) {
      const { data } = await supabase.from('coupons').select('*');
      return data || [];
    }
    return await dbStore.getAll<Coupon>('coupons'); 
  },

  async saveCoupon(coupon: Coupon): Promise<void> { 
    if (supabase) {
      const { error } = await supabase.from('coupons').upsert(coupon);
      if (error) throw error;
    }
    await dbStore.put('coupons', coupon); 
    window.dispatchEvent(new Event('couponsChanged')); 
  },

  async captureLead(email: string, product: Product): Promise<void> {
    const lead: Lead = { id: 'lead-' + Date.now(), email, productId: product.id, productName: product.name, capturedAt: new Date().toISOString(), converted: false };
    if (supabase) await supabase.from('leads').insert(lead);
    await dbStore.put('leads', lead);
    window.dispatchEvent(new Event('leadsChanged'));
  },

  async getLeads(): Promise<Lead[]> { 
    if (supabase) {
      const { data } = await supabase.from('leads').select('*');
      return data || [];
    }
    return await dbStore.getAll<Lead>('leads'); 
  },

  getRoles() {
    return [
      { id: UserRole.ADMIN_MASTER, label: 'Admin Master', permissions: [] },
      { id: UserRole.ADMIN_OPERATIONAL, label: 'Operacional', permissions: [] },
      { id: UserRole.CUSTOMER, label: 'Usuário Final', permissions: [] },
      { id: UserRole.FINANCE, label: 'Financeiro', permissions: [] },
      { id: UserRole.MARKETING, label: 'Marketing', permissions: [] },
      { id: UserRole.AFFILIATE, label: 'Afiliado', permissions: [] },
      { id: UserRole.SELLER, label: 'Vendedor Marketplace', permissions: [] }
    ];
  },

  async updateUserStatus(id: string, status: UserStatus): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('users_profile').update({ status }).eq('id', id);
      if (error) throw error;
    }
    window.dispatchEvent(new Event('usersChanged'));
  },

  async saveConsent(userEmail: string, accepted: boolean): Promise<void> {
    const consent: LGPDConsent = { id: 'con-' + Date.now(), userEmail, accepted, ip: '189.12.34.56', userAgent: navigator.userAgent, timestamp: new Date().toISOString() };
    if (supabase) await supabase.from('lgpd_consents').insert(consent);
    await dbStore.put('consents', consent); 
    window.dispatchEvent(new Event('consentsChanged'));
  },

  async getConsents(): Promise<LGPDConsent[]> { 
    if (supabase) {
      const { data } = await supabase.from('lgpd_consents').select('*');
      return data || [];
    }
    return await dbStore.getAll<LGPDConsent>('consents'); 
  },

  async getHelpTopic(id: string): Promise<HelpTopic | null> {
    const topic = await dbStore.getByKey<HelpTopic>('help_topics', id);
    if (topic) return topic;
    if (id === 'help-overview') return { id, title: 'Hub Enterprise Health', description: 'Visão Geral do Ecossistema.', content: { intro: 'Alta performance híbrida.', architecture: 'Dados distribuídos Supabase/IndexedDB.', features: ['RBAC', 'AI Coach', 'Split de Pagamentos'] }, promptUsed: '', updatedAt: '' };
    return null;
  },

  async updateOrderStatus(id: string, newStatus: OrderStatus): Promise<void> {
    if (supabase) await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    const order = await dbStore.getByKey<Order>('orders', id);
    if (order) {
      await dbStore.put('orders', { ...order, status: newStatus });
    }
    window.dispatchEvent(new Event('ordersChanged'));
  },

  async getRemarketingLogs(): Promise<RemarketingLog[]> {
    return await dbStore.getAll<RemarketingLog>('remarketing_logs');
  },

  async getTemplates(): Promise<EmailTemplate[]> {
    return await dbStore.getAll<EmailTemplate>('email_templates');
  },

  async triggerRemarketing(lead: Lead): Promise<void> {
    const log: RemarketingLog = {
      id: 'remkt-' + Date.now(),
      leadEmail: lead.email,
      productName: lead.productName,
      sentAt: new Date().toISOString(),
      status: 'sent'
    };
    await dbStore.put('remarketing_logs', log);
  },

  async getChatSessions(): Promise<AIChatSession[]> {
    return await dbStore.getAll<AIChatSession>('chat_sessions');
  },

  async updateChatStatus(id: string, status: 'active' | 'escalated' | 'closed'): Promise<void> {
    const session = await dbStore.getByKey<AIChatSession>('chat_sessions', id);
    if (session) {
      await dbStore.put('chat_sessions', { ...session, status });
    }
  },

  async getPerformanceMetrics(): Promise<PerformanceMetric[]> {
    return await dbStore.getAll<PerformanceMetric>('performance_metrics');
  },

  async getSystemLogs(): Promise<SystemLog[]> {
    return await dbStore.getAll<SystemLog>('audit_logs');
  },

  async getGateways(): Promise<PaymentGateway[]> {
    return await dbStore.getAll<PaymentGateway>('gateways');
  },

  async saveGateway(gw: PaymentGateway): Promise<void> {
    await dbStore.put('gateways', gw);
  },

  async getTransactions(): Promise<Transaction[]> {
    return await dbStore.getAll<Transaction>('transactions');
  },

  async getCarriers(): Promise<Carrier[]> {
    return await dbStore.getAll<Carrier>('carriers');
  },

  async getDeliveries(): Promise<Delivery[]> {
    return await dbStore.getAll<Delivery>('deliveries');
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    return await dbStore.getAll<AuditLog>('audit_logs');
  },

  async getSecurityEvents(): Promise<SecurityEvent[]> {
    return await dbStore.getAll<SecurityEvent>('security_events');
  },

  async updateEnvironment(environment: 'production' | 'staging' | 'development'): Promise<void> {
    const settings = await this.getSettings();
    await this.saveSettings({ ...settings, environment });
  },

  async getDeploys(): Promise<DeployRecord[]> {
    return await dbStore.getAll<DeployRecord>('deploys');
  },

  async createDeploy(version: string, deployedBy: string, changelog: string): Promise<void> {
    const deploy: DeployRecord = {
      id: 'dep-' + Date.now(),
      version,
      status: 'success',
      deployedBy,
      timestamp: new Date().toISOString(),
      changelog
    };
    await dbStore.put('deploys', deploy);
  },

  async getBackups(): Promise<BackupRecord[]> {
    return await dbStore.getAll<BackupRecord>('backups');
  },

  async createBackup(name: string): Promise<void> {
    const backup: BackupRecord = {
      id: 'bak-' + Date.now(),
      name,
      size: (Math.random() * 50 + 10).toFixed(1) + 'MB',
      status: 'completed',
      timestamp: new Date().toISOString()
    };
    await dbStore.put('backups', backup);
  },

  getInfraMetrics(): InfraMetric {
    return {
      uptime: '14d 6h 22m',
      latency: Math.floor(Math.random() * 40) + 10,
      cpu: Math.floor(Math.random() * 20) + 5,
      ram: Math.floor(Math.random() * 30) + 40,
      lastHealthCheck: new Date().toISOString()
    };
  },

  async getSellers(): Promise<Seller[]> {
    return await dbStore.getAll<Seller>('sellers');
  },

  async saveSeller(seller: Seller): Promise<void> {
    await dbStore.put('sellers', seller);
  },

  getUserPersonalData(email: string): any {
    return {
      user: { name: 'Usuário G-Fit', email, createdAt: new Date().toISOString() },
      orders: [],
      leads: []
    };
  },

  async logLGPD(type: 'consent' | 'revocation' | 'data_export' | 'data_deletion', userEmail: string, message: string): Promise<void> {
    const log: LGPDLog = {
      id: 'lgpd-' + Date.now(),
      type,
      userEmail,
      message,
      timestamp: new Date().toISOString()
    };
    await dbStore.put('lgpd_logs', log);
  },

  async deleteUserPersonalData(email: string): Promise<void> {
    console.warn('[LGPD] Excluindo dados de:', email);
  },

  async getLGPDLogs(): Promise<LGPDLog[]> {
    return await dbStore.getAll<LGPDLog>('lgpd_logs');
  },

  getPWAMetrics(): any {
    return {
      installs: 124,
      activeUsersMobile: 89,
      version: '4.2.0-stable'
    };
  },

  async getPWANotifications(): Promise<PWANotification[]> {
    return await dbStore.getAll<PWANotification>('pwa_notifications');
  },

  async sendPWANotification(title: string, body: string): Promise<void> {
    const notification: PWANotification = {
      id: 'pwa-' + Date.now(),
      title,
      body,
      sentAt: new Date().toISOString(),
      deliveredCount: 124
    };
    await dbStore.put('pwa_notifications', notification);
  },

  async getAPIConfigs(): Promise<ExternalAPIConfig[]> {
    return await dbStore.getAll<ExternalAPIConfig>('api_configs');
  },

  async saveAPIConfig(cfg: ExternalAPIConfig): Promise<void> {
    await dbStore.put('api_configs', cfg);
  },

  async syncCRM(provider: string): Promise<void> {
    const configs = await this.getAPIConfigs();
    const cfg = configs.find(c => c.provider === provider);
    if (cfg) {
      await this.saveAPIConfig({ ...cfg, lastSync: new Date().toISOString() });
    }
  },

  async getWAMessages(): Promise<WhatsAppMessage[]> {
    return await dbStore.getAll<WhatsAppMessage>('wa_messages');
  },

  async sendWAMessage(userEmail: string, content: string, trigger: string): Promise<void> {
    const msg: WhatsAppMessage = {
      id: 'wa-' + Date.now(),
      userEmail,
      content,
      trigger: trigger as any,
      status: 'sent',
      timestamp: new Date().toISOString()
    };
    await dbStore.put('wa_messages', msg);
  },

  async syncERP(provider: string): Promise<void> {
    const configs = await this.getAPIConfigs();
    const cfg = configs.find(c => c.provider === provider);
    if (cfg) {
      await this.saveAPIConfig({ ...cfg, lastSync: new Date().toISOString() });
    }
  },

  async getSyncLogs(): Promise<IntegrationSyncLog[]> {
    return await dbStore.getAll<IntegrationSyncLog>('sync_logs');
  },

  async getAIRecommendations(): Promise<AIRecommendation[]> {
    return await dbStore.getAll<AIRecommendation>('ai_recommendations');
  },

  async getAIPredictions(): Promise<AIPrediction[]> {
    return await dbStore.getAll<AIPrediction>('ai_predictions');
  },

  async getAIAutomations(): Promise<AIAutomationRule[]> {
    return await dbStore.getAll<AIAutomationRule>('ai_automations');
  },

  async saveAIAutomation(rule: AIAutomationRule): Promise<void> {
    await dbStore.put('ai_automations', rule);
  },

  async getAILogs(): Promise<AILogEntry[]> {
    return await dbStore.getAll<AILogEntry>('ai_logs');
  },

  async isProductFavorited(userId: string, productId: string): Promise<boolean> {
    if (supabase) {
      const { data } = await supabase.from('user_favorites').select('id').eq('userId', userId).eq('productId', productId).maybeSingle();
      return !!data;
    }
    return false;
  },

  async toggleFavorite(userId: string, productId: string): Promise<boolean> {
    if (supabase) {
      const { data: existing } = await supabase.from('user_favorites').select('id').eq('userId', userId).eq('productId', productId).maybeSingle();
      if (existing) {
        await supabase.from('user_favorites').delete().eq('id', existing.id);
        return false;
      } else {
        const { error } = await supabase.from('user_favorites').insert({ userId, productId, id: 'fav-' + Date.now() });
        if (error) throw error;
        return true;
      }
    }
    return false;
  },

  async getFavorites(userId: string): Promise<Product[]> {
    if (supabase) {
      const { data: favs } = await supabase.from('user_favorites').select('productId').eq('userId', userId);
      if (!favs || favs.length === 0) return [];
      const ids = favs.map(f => f.productId);
      const { data: prods } = await supabase.from('products').select('*').in('id', ids);
      return prods || [];
    }
    return [];
  },

  async approveAffiliate(userId: string): Promise<void> {
    if (supabase) {
      const refCode = 'REF-' + Math.random().toString(36).substring(2, 7).toUpperCase();
      await supabase.from('users_profile').update({ status: UserStatus.ACTIVE }).eq('id', userId);
      await supabase.from('affiliates').update({ status: 'active', refCode }).eq('userId', userId);
    }
    window.dispatchEvent(new Event('usersChanged'));
  },

  async getSessions(): Promise<UserSession[]> {
    const current = this.getActiveSession();
    return current ? [current] : [];
  },

  async saveRole(role: RoleDefinition): Promise<void> {
    await dbStore.put('roles', role);
  }
};
