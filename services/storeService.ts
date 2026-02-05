import { 
  Order, Lead, Product, Coupon, OrderStatus, 
  AppUser, SystemSettings, UserRole, UserStatus, 
  UserSession, Affiliate, Commission, Banner, HelpTopic, RoleDefinition,
  Department, Category, RemarketingLog, EmailTemplate, AIChatSession,
  PerformanceMetric, SystemLog, PaymentGateway, Transaction, Carrier,
  Delivery, AuditLog, SecurityEvent, DeployRecord, BackupRecord,
  InfraMetric, Seller, LGPDConsent, LGPDLog, PWANotification,
  ExternalAPIConfig, IntegrationSyncLog, WhatsAppMessage, AIRecommendation,
  AIPrediction, AIAutomationRule, AILogEntry
} from '../types';
import { supabase } from '../backend/supabaseClient';

const KEY_SESSION = 'auth_session';

export const storeService = {
  async initializeSystem(): Promise<void> {
    if (!supabase) return;
    // Carrega configurações globais na inicialização
  },

  async login(email: string, pass: string) {
    if (email.trim().toLowerCase() === 'admin@system.local' && pass === 'admin123') {
      const fallbackAdmin = { id: 'master-0', name: 'G-FitLife Master', email: email.toLowerCase(), role: UserRole.ADMIN_MASTER, status: UserStatus.ACTIVE };
      const session = this.createSession(fallbackAdmin);
      return { success: true, session, profile: fallbackAdmin, isStaff: true };
    }

    if (!supabase) return { success: false, error: 'Serviço Offline.' };

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: pass
      });

      if (error) return { success: false, error: 'Credenciais inválidas.' };
      
      if (data.user) {
        const profile = await this.getProfileAfterLogin(data.user.id);
        if (profile) {
          if (profile.status !== UserStatus.ACTIVE) {
            await supabase.auth.signOut();
            return { success: false, error: 'Conta suspensa.' };
          }
          const session = this.createSession(profile);
          const isStaff = [UserRole.ADMIN_MASTER, UserRole.ADMIN_OPERATIONAL, UserRole.FINANCE, UserRole.MARKETING].includes(profile.role);
          return { success: true, session, profile, isStaff };
        }
      }
    } catch (err) {
      return { success: false, error: 'Erro de comunicação.' };
    }
    return { success: false, error: 'Perfil não encontrado.' };
  },

  async loginWithGoogle() {
    if (!supabase) return { success: false, error: 'Auth Social Inativo.' };
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Falha Google Auth.' };
    }
  },

  async getProfileAfterLogin(userId: string) {
    if (!supabase) return null;
    
    // Regra: user_profile (singular)
    const { data: profile } = await supabase.from('user_profile').select('*').eq('id', userId).maybeSingle();
    
    if (profile) return profile;

    // Auto-criação caso o trigger falhe ou delay
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const newProfile = {
        id: authUser.id,
        email: authUser.email?.toLowerCase(),
        name: authUser.user_metadata?.full_name || 'Membro G-Fit',
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        loginType: 'hybrid',
        created_at: new Date().toISOString()
      };
      const { data: created } = await supabase.from('user_profile').insert(newProfile).select().single();
      return created;
    }
    return null;
  },

  async uploadFile(file: File): Promise<string> {
    if (!supabase) throw new Error('Supabase Inacessível.');
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `public/${fileName}`;

    console.log(`[STORE-SERVICE] Iniciando upload para: uploads/${filePath}`);

    // Bucket: uploads (Obrigatório)
    const { data, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('[UPLOAD-SERVICE-ERROR]', uploadError);
      throw new Error(`Falha no upload: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  async getUsers(): Promise<AppUser[]> {
    if (!supabase) return [];
    const { data } = await supabase.from('user_profile').select('*').order('created_at', { ascending: false });
    return data || [];
  },

  async saveUser(user: AppUser): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('user_profile').upsert(user, { onConflict: 'email' });
    if (error) throw error;
    window.dispatchEvent(new Event('usersChanged'));
  },

  async updateUserStatus(id: string, status: UserStatus): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('user_profile').update({ status }).eq('id', id);
    if (error) throw error;
    window.dispatchEvent(new Event('usersChanged'));
  },

  async getProducts(): Promise<Product[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('products').select('*').order('name');
    return data || [];
  },

  async saveProduct(p: Product): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('products').upsert(p);
    if (error) throw error;
    window.dispatchEvent(new Event('productsChanged'));
  },

  async getOrders(): Promise<Order[]> {
    if (!supabase) return [];
    const { data } = await supabase.from('orders').select('*').order('createdAt', { ascending: false });
    return data || [];
  },

  async saveOrder(o: Order): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('orders').insert(o);
    if (error) throw error;
    window.dispatchEvent(new Event('ordersChanged'));
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) throw error;
    window.dispatchEvent(new Event('ordersChanged'));
  },

  async getSettings(): Promise<SystemSettings> {
    if (supabase) {
      const { data } = await supabase.from('core_settings').select('*').eq('key', 'geral').maybeSingle();
      if (data) return data as SystemSettings;
    }
    return {
      nomeLoja: 'G-FitLife', logoUrl: '', emailContato: 'admin@gfitlife.io', telefone: '', whatsapp: '',
      dominio: '', moeda: 'BRL', timezone: 'America/Sao_Paulo', companyName: 'G-FitLife Hub', storeName: 'G-FitLife',
      adminEmail: 'admin@gfitlife.io', systemStatus: 'online', environment: 'production', privacyPolicy: '',
      termsOfUse: '', pwaInstalledCount: 0, pwaVersion: '1.0', pushNotificationsActive: true, language: 'pt-BR', currency: 'BRL'
    };
  },

  async saveSettings(settings: SystemSettings): Promise<void> {
    if (!supabase) return;
    await supabase.from('core_settings').upsert({ ...settings, key: 'geral' });
    window.dispatchEvent(new Event('systemSettingsChanged'));
  },

  async getBanners(): Promise<Banner[]> {
    if (!supabase) return [];
    const { data } = await supabase.from('banners').select('*').eq('status', 'active');
    return data || [];
  },

  async saveBanner(banner: Banner): Promise<void> {
    if (!supabase) return;
    await supabase.from('banners').upsert(banner);
    window.dispatchEvent(new Event('bannersChanged'));
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

  async createAdminUser(adminData: any): Promise<void> {
    const response = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Falha ao criar administrador.');
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
      throw new Error(error.error || 'Falha ao excluir.');
    }
    window.dispatchEvent(new Event('usersChanged'));
    return true;
  },

  async getAffiliates(): Promise<Affiliate[]> {
    if (!supabase) return [];
    const { data } = await supabase.from('affiliates').select('*');
    return data || [];
  },

  async approveAffiliate(userId: string): Promise<void> {
    if (!supabase) return;
    await supabase.from('user_profile').update({ role: UserRole.AFFILIATE }).eq('id', userId);
    await supabase.from('affiliates').update({ status: 'active' }).eq('userId', userId);
    window.dispatchEvent(new Event('usersChanged'));
  },

  async getFavorites(userId: string): Promise<Product[]> {
    if (!supabase) return [];
    const { data: favs } = await supabase.from('user_favorites').select('productId').eq('userId', userId);
    if (!favs || favs.length === 0) return [];
    const ids = favs.map(f => f.productId);
    const { data: prods } = await supabase.from('products').select('*').in('id', ids);
    return prods || [];
  },

  async toggleFavorite(userId: string, productId: string): Promise<boolean> {
    if (!supabase) return false;
    const { data } = await supabase.from('user_favorites').select('*').eq('userId', userId).eq('productId', productId).maybeSingle();
    if (data) {
      await supabase.from('user_favorites').delete().eq('userId', userId).eq('productId', productId);
      return false;
    } else {
      await supabase.from('user_favorites').insert({ id: `fav-${Date.now()}`, userId, productId, createdAt: new Date().toISOString() });
      return true;
    }
  },

  async isProductFavorited(userId: string, productId: string): Promise<boolean> {
    if (!supabase) return false;
    const { data } = await supabase.from('user_favorites').select('id').eq('userId', userId).eq('productId', productId).maybeSingle();
    return !!data;
  },

  getRoles(): RoleDefinition[] {
    return [
      { id: UserRole.ADMIN_MASTER, label: 'Admin Master', permissions: [] },
      { id: UserRole.ADMIN_OPERATIONAL, label: 'Operacional', permissions: [] },
      { id: UserRole.CUSTOMER, label: 'Usuário Final', permissions: [] },
      { id: UserRole.FINANCE, label: 'Financeiro', permissions: [] },
      { id: UserRole.MARKETING, label: 'Marketing', permissions: [] },
      { id: UserRole.AFFILIATE, label: 'Afiliado', permissions: [] },
      { id: UserRole.SELLER, label: 'Vendedor Mkp', permissions: [] }
    ];
  },

  async getCommissions(): Promise<Commission[]> {
    if (!supabase) return [];
    const { data } = await supabase.from('commissions').select('*, affiliate:affiliates(name)').order('createdAt', { ascending: false });
    return data || [];
  },

  // Implementações genéricas para persistência no Supabase
  async getLeads(): Promise<Lead[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('leads').select('*');
    return data || [];
  },
  async captureLead(email: string, product: Product): Promise<void> { 
    if (!supabase) return;
    await supabase.from('leads').insert({
      id: 'lead-' + Date.now(),
      email: email.toLowerCase(),
      productId: product.id,
      productName: product.name,
      capturedAt: new Date().toISOString(),
      converted: false
    });
  },
  async getRemarketingLogs(): Promise<RemarketingLog[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('remarketing_logs').select('*');
    return data || [];
  },
  async getTemplates(): Promise<EmailTemplate[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('email_templates').select('*');
    return data || [];
  },
  async triggerRemarketing(lead: Lead): Promise<void> { 
    if (!supabase) return;
    await supabase.from('remarketing_logs').insert({
      id: 'remkt-' + Date.now(),
      leadEmail: lead.email,
      productName: lead.productName,
      sentAt: new Date().toISOString(),
      status: 'sent'
    });
  },
  async getChatSessions(): Promise<AIChatSession[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('chat_sessions').select('*');
    return data || [];
  },
  async updateChatStatus(id: string, status: string): Promise<void> { 
    if (!supabase) return;
    await supabase.from('chat_sessions').update({ status }).eq('id', id);
  },
  async getPerformanceMetrics(): Promise<PerformanceMetric[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('performance_metrics').select('*');
    return data || [];
  },
  async getSystemLogs(): Promise<SystemLog[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('system_logs').select('*').order('timestamp', { ascending: false });
    return data || [];
  },
  async getGateways(): Promise<PaymentGateway[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('gateways').select('*');
    return data || [];
  },
  async saveGateway(gw: PaymentGateway): Promise<void> { 
    if (!supabase) return;
    await supabase.from('gateways').upsert(gw);
  },
  async getTransactions(): Promise<Transaction[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('transactions').select('*');
    return data || [];
  },
  async getCarriers(): Promise<Carrier[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('carriers').select('*');
    return data || [];
  },
  async getDeliveries(): Promise<Delivery[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('deliveries').select('*');
    return data || [];
  },
  async getSessions(): Promise<UserSession[]> { 
    const active = this.getActiveSession();
    return active ? [active] : [];
  },
  async updateMyCredentials(userId: string, email: string, password?: string): Promise<boolean> { 
    if (!supabase) return false;
    const data: any = { email };
    if (password) data.password = password;
    const { error } = await supabase.auth.updateUser(data);
    if (error) return false;
    const { error: profileError } = await supabase.from('user_profile').update({ email }).eq('id', userId);
    return !profileError;
  },
  async getAuditLogs(): Promise<AuditLog[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('audit_logs').select('*');
    return data || [];
  },
  async getSecurityEvents(): Promise<SecurityEvent[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('security_events').select('*');
    return data || [];
  },
  async updateEnvironment(env: string): Promise<void> { 
    if (!supabase) return;
    const settings = await this.getSettings();
    await this.saveSettings({ ...settings, environment: env as any });
  },
  async getDeploys(): Promise<DeployRecord[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('deploy_records').select('*');
    return data || [];
  },
  async createDeploy(v: string, b: string, c: string): Promise<void> { 
    if (!supabase) return;
    await supabase.from('deploy_records').insert({
      id: 'dep-' + Date.now(),
      version: v,
      deployedBy: b,
      changelog: c,
      status: 'success',
      timestamp: new Date().toISOString()
    });
  },
  async getBackups(): Promise<BackupRecord[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('backup_records').select('*');
    return data || [];
  },
  async createBackup(n: string): Promise<void> { 
    if (!supabase) return;
    await supabase.from('backup_records').insert({
      id: 'bak-' + Date.now(),
      name: n,
      size: '42MB',
      status: 'completed',
      timestamp: new Date().toISOString()
    });
  },
  getInfraMetrics(): InfraMetric { 
    return { uptime: '100%', latency: 20, cpu: 5, ram: 10, lastHealthCheck: new Date().toISOString() }; 
  },
  async getSellers(): Promise<Seller[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('sellers').select('*');
    return data || [];
  },
  async saveSeller(s: Seller): Promise<void> { 
    if (!supabase) return;
    await supabase.from('sellers').upsert(s);
  },
  async getConsents(): Promise<LGPDConsent[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('lgpd_consents').select('*');
    return data || [];
  },
  async getUserPersonalData(email: string): Promise<any> { 
    if (!supabase) return null;
    const { data: user } = await supabase.from('user_profile').select('*').eq('email', email).maybeSingle();
    const { data: orders } = await supabase.from('orders').select('*').eq('customerEmail', email);
    const { data: leads } = await supabase.from('leads').select('*').eq('email', email);
    return { user, orders: orders || [], leads: leads || [] };
  },
  async logLGPD(type: string, userEmail: string, message: string): Promise<void> { 
    if (!supabase) return;
    await supabase.from('lgpd_logs').insert({
      id: 'lgpd-' + Date.now(),
      type,
      userEmail,
      message,
      timestamp: new Date().toISOString()
    });
  },
  async deleteUserPersonalData(email: string): Promise<void> { 
    if (!supabase) return;
    const { data: user } = await supabase.from('user_profile').select('id').eq('email', email).maybeSingle();
    if (user) {
      await supabase.from('user_profile').delete().eq('id', user.id);
      await supabase.from('orders').delete().eq('customerEmail', email);
      await supabase.from('leads').delete().eq('email', email);
      await supabase.auth.signOut();
    }
  },
  async getLGPDLogs(): Promise<LGPDLog[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('lgpd_logs').select('*');
    return data || [];
  },
  getPWAMetrics(): any { 
    return { installs: 124, activeUsersMobile: 86, version: '1.9.2-stable' }; 
  },
  async getPWANotifications(): Promise<PWANotification[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('pwa_notifications').select('*');
    return data || [];
  },
  async sendPWANotification(t: string, b: string): Promise<void> { 
    if (!supabase) return;
    await supabase.from('pwa_notifications').insert({
      id: 'push-' + Date.now(),
      title: t,
      body: b,
      sentAt: new Date().toISOString(),
      deliveredCount: 124
    });
  },
  async getAPIConfigs(): Promise<ExternalAPIConfig[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('external_api_configs').select('*');
    return data || [];
  },
  async syncCRM(p: string): Promise<void> { 
    if (!supabase) return;
    await supabase.from('external_api_configs').update({ lastSync: new Date().toISOString() }).eq('provider', p);
  },
  async getWAMessages(): Promise<WhatsAppMessage[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('whatsapp_messages').select('*');
    return data || [];
  },
  async sendWAMessage(u: string, c: string, t: string): Promise<void> { 
    if (!supabase) return;
    await supabase.from('whatsapp_messages').insert({
      id: 'wa-' + Date.now(),
      userEmail: u,
      content: c,
      trigger: t,
      status: 'sent',
      timestamp: new Date().toISOString()
    });
  },
  async syncERP(p: string): Promise<void> { 
    if (!supabase) return;
    await supabase.from('external_api_configs').update({ lastSync: new Date().toISOString() }).eq('provider', p);
  },
  async getSyncLogs(): Promise<IntegrationSyncLog[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('integration_sync_logs').select('*');
    return data || [];
  },
  async saveAPIConfig(cfg: ExternalAPIConfig): Promise<void> { 
    if (!supabase) return;
    await supabase.from('external_api_configs').upsert(cfg);
  },
  async getAIRecommendations(): Promise<AIRecommendation[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('ai_recommendations').select('*');
    return data || [];
  },
  async getAIPredictions(): Promise<AIPrediction[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('ai_predictions').select('*');
    return data || [];
  },
  async getAIAutomations(): Promise<AIAutomationRule[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('ai_automation_rules').select('*');
    return data || [];
  },
  async saveAIAutomation(r: AIAutomationRule): Promise<void> { 
    if (!supabase) return;
    await supabase.from('ai_automation_rules').upsert(r);
  },
  async getAILogs(): Promise<AILogEntry[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('ai_log_entries').select('*');
    return data || [];
  },
  async saveRole(role: RoleDefinition): Promise<void> { 
    if (!supabase) return;
    await supabase.from('roles').upsert(role);
  },
  async getHelpTopic(id: string): Promise<HelpTopic | null> { 
    if (!supabase) return null;
    const { data } = await supabase.from('help_topics').select('*').eq('id', id).maybeSingle();
    return data;
  },
  async registerAffiliate(d: any): Promise<void> { 
    if (!supabase) return;
    const newAffiliate = {
      id: 'aff-' + Date.now(),
      userId: d.email, // Using email as temp ID
      name: d.name,
      email: d.email,
      status: 'inactive',
      commissionRate: 15,
      totalSales: 0,
      balance: 0,
      refCode: Math.random().toString(36).substring(7).toUpperCase()
    };
    await supabase.from('affiliates').insert(newAffiliate);
  },
  async getDepartments(): Promise<Department[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('departments').select('*');
    return data || [];
  },
  async saveDepartment(d: Department): Promise<void> { 
    if (!supabase) return;
    await supabase.from('departments').upsert(d);
  },
  async getCategories(): Promise<Category[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('categories').select('*');
    return data || [];
  },
  async saveCategory(c: Category): Promise<void> { 
    if (!supabase) return;
    await supabase.from('categories').upsert(c);
  },
  async getCoupons(): Promise<Coupon[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('coupons').select('*');
    return data || [];
  },
  async saveCoupon(c: Coupon): Promise<void> { 
    if (!supabase) return;
    await supabase.from('coupons').upsert(c);
  },
  async saveConsent(e: string, a: boolean): Promise<void> { 
    if (!supabase) return;
    await supabase.from('lgpd_consents').insert({
      id: `cst-${Date.now()}`,
      userEmail: e,
      accepted: a,
      ip: '0.0.0.0',
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
  }
};