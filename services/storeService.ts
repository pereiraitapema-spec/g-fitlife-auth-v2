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

      if (supabase) {
        const { data: remoteUsers } = await supabase.from('users_profile').select('*');
        if (remoteUsers) {
          for (const u of remoteUsers) {
            await dbStore.put('users', u);
          }
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

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: pass
        });

        if (!error && data.user) {
          const profile = await this.getProfileAfterLogin(data.user.id);
          if (profile) {
            if (profile.status !== UserStatus.ACTIVE) {
              return { success: false, error: 'Conta suspensa ou aguardando aprovação.' };
            }
            const session = this.createSession(profile);
            const staffRoles = [
              UserRole.ADMIN_MASTER, 
              UserRole.ADMIN_OPERATIONAL, 
              UserRole.FINANCE, 
              UserRole.MARKETING, 
              UserRole.SELLER
            ];
            const isStaff = staffRoles.includes(profile.role);
            return { success: true, session, profile, isStaff };
          } else {
             await supabase.auth.signOut();
             return { success: false, error: 'Email não autorizado no sistema' };
          }
        } else if (error) {
           return { success: false, error: 'Credenciais inválidas ou acesso não autorizado.' };
        }
      } catch (err) {
        console.error("Erro auth remota:", err);
      }
    }
    
    return { success: false, error: 'Falha na conexão com o servidor de autenticação.' };
  },

  async loginWithGoogle() {
    if (!supabase) return { success: false, error: 'Serviço de autenticação indisponível.' };
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo: window.location.origin,
          queryParams: { prompt: 'select_account' }
        }
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Erro ao conectar com Google Workspace' };
    }
  },

  async toggleFavorite(userId: string, productId: string): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { data: existing } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('userId', userId)
        .eq('productId', productId)
        .single();

      if (existing) {
        await supabase.from('user_favorites').delete().eq('id', existing.id);
        return false; // Removido
      } else {
        await supabase.from('user_favorites').insert({
          userId,
          productId,
          createdAt: new Date().toISOString()
        });
        return true; // Adicionado
      }
    } catch (err) {
      return false;
    }
  },

  async getFavorites(userId: string): Promise<Product[]> {
    if (!supabase) return [];
    try {
      const { data: favs } = await supabase
        .from('user_favorites')
        .select('productId')
        .eq('userId', userId);
      
      if (!favs || favs.length === 0) return [];
      
      const productIds = favs.map(f => f.productId);
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);
        
      return products || [];
    } catch (err) {
      return [];
    }
  },

  async isProductFavorited(userId: string, productId: string): Promise<boolean> {
    if (!supabase) return false;
    const { data } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('userId', userId)
      .eq('productId', productId)
      .single();
    return !!data;
  },

  async registerAffiliate(data: { name: string, email: string, reason: string }) {
    if (supabase) {
      const newAffiliate = {
        name: data.name,
        email: data.email.toLowerCase(),
        role: UserRole.AFFILIATE,
        status: UserStatus.INACTIVE, 
        created_at: new Date().toISOString()
      };
      
      const { data: res, error } = await supabase.from('users_profile').insert(newAffiliate).select().single();
      if (error) throw error;

      await supabase.from('affiliates').insert({
        userId: res.id,
        name: res.name,
        email: res.email,
        status: 'inactive',
        commissionRate: 15,
        totalSales: 0,
        balance: 0,
        refCode: '' 
      });

      return { success: true };
    }
    return { success: false };
  },

  async approveAffiliate(userId: string) {
    if (supabase) {
      const refCode = 'REF-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      await supabase.from('users_profile').update({ status: UserStatus.ACTIVE }).eq('id', userId);
      await supabase.from('affiliates').update({ 
        status: 'active',
        refCode: refCode 
      }).eq('userId', userId);
      window.dispatchEvent(new Event('usersChanged'));
      return true;
    }
    return false;
  },

  async updateMyCredentials(userId: string, email: string, password?: string) {
    if (!supabase) return false;
    try {
      const updates: any = { email };
      if (password) updates.password = password;
      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;
      await this.logAudit(userId, `Auto-atualização de segurança realizada pelo usuário.`);
      return true;
    } catch (err) {
      return false;
    }
  },

  async logAudit(userId: string, action: string) {
    if (supabase) {
      const { data: profile } = await supabase.from('users_profile').select('name').eq('id', userId).single();
      await supabase.from('audit_logs').insert({
        userId,
        userName: profile?.name || 'Sistema',
        action,
        timestamp: new Date().toISOString()
      });
    }
  },

  async uploadFile(file: File): Promise<string> {
    if (!supabase) return URL.createObjectURL(file);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `public/${fileName}`;
    const { error } = await supabase.storage.from('uploads').upload(filePath, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(filePath);
    return publicUrl;
  },

  async getProfileAfterLogin(userId: string) {
     if (!supabase) return null;

     // 1. Tentar buscar pelo ID (Padrão Supabase Auth)
     const { data: profile } = await supabase.from('users_profile').select('*').eq('id', userId).single();
     if (profile) return profile;

     // 2. Se não encontrar pelo ID, buscar pelo E-mail (Fluxo OAuth para usuários pré-cadastrados)
     const { data: { user: authUser } } = await supabase.auth.getUser();
     if (authUser) {
        const email = authUser.email?.toLowerCase();
        const { data: allProfiles } = await supabase.from('users_profile').select('*');
        const found = allProfiles?.find(p => p.email.toLowerCase() === email);
        
        if (found) {
           // Sincroniza o ID da tabela de perfis com o ID do Auth do Supabase
           await supabase.from('users_profile').update({ id: authUser.id }).eq('id', found.id);
           return { ...found, id: authUser.id };
        }
     }
     return null;
  },

  async getSettings(): Promise<SystemSettings> {
    const data = await dbStore.getByKey<any>('config', 'geral');
    return data as SystemSettings;
  },

  async saveSettings(settings: SystemSettings): Promise<void> {
    const dataToSave = { ...settings, key: 'geral' };
    await dbStore.put('config', dataToSave);
    if (supabase) await supabase.from('core_settings').upsert(dataToSave);
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
      const { data } = await supabase.from('users_profile').select('*');
      return data || [];
    }
    return await dbStore.getAll<AppUser>('users');
  },

  async saveUser(user: AppUser): Promise<void> {
    await dbStore.put('users', user);
    if (supabase) await supabase.from('users_profile').upsert(user);
    window.dispatchEvent(new Event('usersChanged'));
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
  async getDepartments(): Promise<Department[]> { return await dbStore.getAll<Department>('departments'); },
  async getCategories(): Promise<Category[]> { return await dbStore.getAll<Category>('categories'); },
  async getCoupons(): Promise<Coupon[]> { return await dbStore.getAll<Coupon>('coupons'); },

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
    if (supabase) await supabase.from('users_profile').update({ status }).eq('id', id);
    window.dispatchEvent(new Event('usersChanged'));
  },

  async saveDepartment(dept: Department): Promise<void> { await dbStore.put('departments', dept); window.dispatchEvent(new Event('departmentsChanged')); },
  async saveCategory(cat: Category): Promise<void> { await dbStore.put('categories', cat); window.dispatchEvent(new Event('categoriesChanged')); },
  async saveCoupon(coupon: Coupon): Promise<void> { await dbStore.put('coupons', coupon); window.dispatchEvent(new Event('couponsChanged')); },
  async saveProduct(p: Product): Promise<void> {
    await dbStore.put('products', p);
    if (supabase) await supabase.from('products').upsert(p);
    window.dispatchEvent(new Event('productsChanged'));
  },
  async saveOrder(o: Order): Promise<void> {
    await dbStore.put('orders', o);
    if (supabase) await supabase.from('orders').insert(o);
    window.dispatchEvent(new Event('ordersChanged'));
  },
  async updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
    const order = await dbStore.getByKey<Order>('orders', id);
    if (order) { order.status = status; await dbStore.put('orders', order); window.dispatchEvent(new Event('ordersChanged')); }
  },
  async captureLead(email: string, product: Product): Promise<void> {
    const lead: Lead = { id: 'lead-' + Date.now(), email, productId: product.id, productName: product.name, capturedAt: new Date().toISOString(), converted: false };
    await dbStore.put('leads', lead);
    window.dispatchEvent(new Event('leadsChanged'));
  },
  async getLeads(): Promise<Lead[]> { return await dbStore.getAll<Lead>('leads'); },
  async getAffiliates(): Promise<Affiliate[]> { 
    if (supabase) {
      const { data } = await supabase.from('affiliates').select('*');
      return data || [];
    }
    return await dbStore.getAll<Affiliate>('affiliates'); 
  },
  async getCommissions(): Promise<Commission[]> { return await dbStore.getAll<Commission>('commissions'); },
  async getBanners(): Promise<Banner[]> { return await dbStore.getAll<Banner>('banners'); },
  async saveBanner(banner: Banner): Promise<void> { await dbStore.put('banners', banner); window.dispatchEvent(new Event('bannersChanged')); },
  async getRemarketingLogs(): Promise<RemarketingLog[]> { return await dbStore.getAll<RemarketingLog>('remarketing_logs'); },
  async getTemplates(): Promise<EmailTemplate[]> { return await dbStore.getAll<EmailTemplate>('email_templates'); },
  async triggerRemarketing(lead: Lead): Promise<void> {
    const log: RemarketingLog = { id: 'rem-' + Date.now(), leadEmail: lead.email, productName: lead.productName, sentAt: new Date().toISOString(), status: 'sent' };
    await dbStore.put('remarketing_logs', log); window.dispatchEvent(new Event('remarketingLogsChanged'));
  },
  async getChatSessions(): Promise<AIChatSession[]> { return await dbStore.getAll<AIChatSession>('chat_sessions'); },
  async updateChatStatus(id: string, status: 'active' | 'escalated' | 'closed'): Promise<void> {
    const session = await dbStore.getByKey<AIChatSession>('chat_sessions', id);
    if (session) { session.status = status; await dbStore.put('chat_sessions', session); window.dispatchEvent(new Event('chatSessionsChanged')); }
  },
  async getPerformanceMetrics(): Promise<PerformanceMetric[]> { return await dbStore.getAll<PerformanceMetric>('performance_metrics'); },
  async getSystemLogs(): Promise<SystemLog[]> { return await dbStore.getAll<SystemLog>('system_logs'); },
  async getGateways(): Promise<PaymentGateway[]> { return await dbStore.getAll<PaymentGateway>('gateways'); },
  async saveGateway(gateway: PaymentGateway): Promise<void> { await dbStore.put('gateways', gateway); window.dispatchEvent(new Event('gatewaysChanged')); },
  async getTransactions(): Promise<Transaction[]> { return await dbStore.getAll<Transaction>('transactions'); },
  async getCarriers(): Promise<Carrier[]> { return await dbStore.getAll<Carrier>('carriers'); },
  async getDeliveries(): Promise<Delivery[]> { return await dbStore.getAll<Delivery>('deliveries'); },
  async getSessions(): Promise<UserSession[]> { return await dbStore.getAll<UserSession>('sessions'); },
  async getAuditLogs(): Promise<AuditLog[]> { 
    if (supabase) {
      const { data } = await supabase.from('audit_logs').select('*');
      return data || [];
    }
    return await dbStore.getAll<AuditLog>('audit_logs'); 
  },
  async getSecurityEvents(): Promise<SecurityEvent[]> { return await dbStore.getAll<SecurityEvent>('security_events'); },
  async updateEnvironment(env: string): Promise<void> {
    const settings = await this.getSettings();
    if (settings) { settings.environment = env as any; await this.saveSettings(settings); }
  },
  async getDeploys(): Promise<DeployRecord[]> { return await dbStore.getAll<DeployRecord>('deploys'); },
  async createDeploy(version: string, deployedBy: string, changelog: string): Promise<void> {
    const deploy: DeployRecord = { id: 'dep-' + Date.now(), version, deployedBy, changelog, timestamp: new Date().toISOString(), status: 'success' };
    await dbStore.put('deploys', deploy); window.dispatchEvent(new Event('deploysChanged'));
  },
  async getBackups(): Promise<BackupRecord[]> { return await dbStore.getAll<BackupRecord>('backups'); },
  async createBackup(name: string): Promise<void> {
    const backup: BackupRecord = { id: 'bak-' + Date.now(), name, size: '15.4 MB', status: 'completed', timestamp: new Date().toISOString() };
    await dbStore.put('backups', backup); window.dispatchEvent(new Event('backupsChanged'));
  },
  getInfraMetrics(): InfraMetric { return { uptime: '22d 4h 10m', latency: 32, cpu: 8, ram: 22, lastHealthCheck: new Date().toISOString() }; },
  async getSellers(): Promise<Seller[]> { return await dbStore.getAll<Seller>('sellers'); },
  async saveSeller(seller: Seller): Promise<void> { await dbStore.put('sellers', seller); window.dispatchEvent(new Event('sellersChanged')); },
  async saveConsent(userEmail: string, accepted: boolean): Promise<void> {
    const consent: LGPDConsent = { id: 'con-' + Date.now(), userEmail, accepted, ip: '189.12.34.56', userAgent: navigator.userAgent, timestamp: new Date().toISOString() };
    await dbStore.put('consents', consent); window.dispatchEvent(new Event('consentsChanged'));
  },
  async getConsents(): Promise<LGPDConsent[]> { return await dbStore.getAll<LGPDConsent>('consents'); },
  async getUserPersonalData(email: string): Promise<any> {
    const users = await this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    const orders = (await this.getOrders()).filter(o => o.customerEmail.toLowerCase() === email.toLowerCase());
    const leads = (await this.getLeads()).filter(l => l.email.toLowerCase() === email.toLowerCase());
    return { user, orders, leads };
  },
  async logLGPD(type: 'consent' | 'revocation' | 'data_export' | 'data_deletion', userEmail: string, message: string): Promise<void> {
    const log: LGPDLog = { id: 'lgpd-' + Date.now(), type, userEmail, message, timestamp: new Date().toISOString() };
    await dbStore.put('lgpd_logs', log); window.dispatchEvent(new Event('lgpdLogsChanged'));
  },
  async deleteUserPersonalData(email: string): Promise<void> { await this.logLGPD('data_deletion', email, 'Exclusão definitiva solicitada.'); },
  async getLGPDLogs(): Promise<LGPDLog[]> { return await dbStore.getAll<LGPDLog>('lgpd_logs'); },
  getPWAMetrics(): any { return { installs: 1242, activeUsersMobile: 856, version: 'v4.0.0' }; },
  async getPWANotifications(): Promise<PWANotification[]> { return await dbStore.getAll<PWANotification>('pwa_notifications'); },
  async sendPWANotification(title: string, body: string): Promise<void> {
    const notif: PWANotification = { id: 'notif-' + Date.now(), title, body, sentAt: new Date().toISOString(), deliveredCount: 124 };
    await dbStore.put('pwa_notifications', notif); window.dispatchEvent(new Event('pwaNotificationsChanged'));
  },
  async getAPIConfigs(): Promise<ExternalAPIConfig[]> { return await dbStore.getAll<ExternalAPIConfig>('api_configs'); },
  async syncCRM(provider: string): Promise<void> {
    const configs = await this.getAPIConfigs();
    const cfg = configs.find(c => c.provider === provider);
    if (cfg) { cfg.lastSync = new Date().toISOString(); await dbStore.put('api_configs', cfg); }
  },
  async getWAMessages(): Promise<WhatsAppMessage[]> { return await dbStore.getAll<WhatsAppMessage>('wa_messages'); },
  async sendWAMessage(userEmail: string, content: string, trigger: any): Promise<void> {
    const msg: WhatsAppMessage = { id: 'wa-' + Date.now(), userEmail, content, trigger, status: 'sent', timestamp: new Date().toISOString() };
    await dbStore.put('wa_messages', msg); window.dispatchEvent(new Event('waMessagesChanged'));
  },
  async syncERP(provider: string): Promise<void> {
    const configs = await this.getAPIConfigs();
    const cfg = configs.find(c => c.provider === provider);
    if (cfg) { cfg.lastSync = new Date().toISOString(); await dbStore.put('api_configs', cfg); }
  },
  async saveAPIConfig(cfg: ExternalAPIConfig): Promise<void> { await dbStore.put('api_configs', cfg); window.dispatchEvent(new Event('apiConfigsChanged')); },
  async getSyncLogs(): Promise<IntegrationSyncLog[]> { return await dbStore.getAll<IntegrationSyncLog>('sync_logs'); },
  async getAIRecommendations(): Promise<AIRecommendation[]> { return await dbStore.getAll<AIRecommendation>('ai_recommendations'); },
  async getAIPredictions(): Promise<AIPrediction[]> { return await dbStore.getAll<AIPrediction>('ai_predictions'); },
  async getAIAutomations(): Promise<AIAutomationRule[]> { return await dbStore.getAll<AIAutomationRule>('ai_automations'); },
  async saveAIAutomation(rule: AIAutomationRule): Promise<void> { await dbStore.put('ai_automations', rule); window.dispatchEvent(new Event('aiAutomationsChanged')); },
  async getAILogs(): Promise<AILogEntry[]> { return await dbStore.getAll<AILogEntry>('ai_logs'); },
  async saveRole(role: RoleDefinition): Promise<void> { await dbStore.put('roles', role); window.dispatchEvent(new Event('rolesChanged')); },
  async getHelpTopic(id: string): Promise<HelpTopic | null> {
    const topic = await dbStore.getByKey<HelpTopic>('help_topics', id);
    if (topic) return topic;
    if (id === 'help-overview') return { id, title: 'Hub Enterprise Health', description: 'Visão Geral do Ecossistema.', content: { intro: 'Alta performance híbrida.', architecture: 'Dados distribuídos Supabase/IndexedDB.', features: ['RBAC', 'AI Coach', 'Split de Pagamentos'] }, promptUsed: '', updatedAt: '' };
    return null;
  }
};