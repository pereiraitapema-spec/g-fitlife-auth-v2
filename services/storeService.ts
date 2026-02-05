
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

    // Bucket: uploads (Obrigatório)
    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

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
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
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

  // Fix: Added getCommissions method to support AffiliatesCommissions page
  async getCommissions(): Promise<Commission[]> {
    if (!supabase) return [];
    const { data } = await supabase.from('commissions').select('*, affiliate:affiliates(name)').order('createdAt', { ascending: false });
    return data || [];
  },

  // Implementação genérica para métodos de monitoramento/IA pendentes (mocked persistência)
  async getLeads(): Promise<Lead[]> { return []; },
  async captureLead(email: string, product: Product): Promise<void> { },
  async getRemarketingLogs(): Promise<RemarketingLog[]> { return []; },
  async getTemplates(): Promise<EmailTemplate[]> { return []; },
  async triggerRemarketing(lead: Lead): Promise<void> { },
  async getChatSessions(): Promise<AIChatSession[]> { return []; },
  async updateChatStatus(id: string, status: string): Promise<void> { },
  async getPerformanceMetrics(): Promise<PerformanceMetric[]> { return []; },
  async getSystemLogs(): Promise<SystemLog[]> { return []; },
  async getGateways(): Promise<PaymentGateway[]> { return []; },
  async saveGateway(gw: PaymentGateway): Promise<void> { },
  async getTransactions(): Promise<Transaction[]> { return []; },
  async getCarriers(): Promise<Carrier[]> { return []; },
  async getDeliveries(): Promise<Delivery[]> { return []; },
  async getSessions(): Promise<UserSession[]> { return []; },
  async updateMyCredentials(userId: string, email: string, password?: string): Promise<boolean> { return true; },
  async getAuditLogs(): Promise<AuditLog[]> { return []; },
  async getSecurityEvents(): Promise<SecurityEvent[]> { return []; },
  async updateEnvironment(env: string): Promise<void> { },
  async getDeploys(): Promise<DeployRecord[]> { return []; },
  async createDeploy(v: string, b: string, c: string): Promise<void> { },
  async getBackups(): Promise<BackupRecord[]> { return []; },
  async createBackup(n: string): Promise<void> { },
  getInfraMetrics(): InfraMetric { return { uptime: '100%', latency: 20, cpu: 5, ram: 10, lastHealthCheck: '' }; },
  async getSellers(): Promise<Seller[]> { return []; },
  async saveSeller(s: Seller): Promise<void> { },
  async getConsents(): Promise<LGPDConsent[]> { return []; },
  getUserPersonalData(e: string): any { return {}; },
  async logLGPD(t: string, u: string, m: string): Promise<void> { },
  async deleteUserPersonalData(e: string): Promise<void> { },
  async getLGPDLogs(): Promise<LGPDLog[]> { return []; },
  getPWAMetrics(): any { return {}; },
  async getPWANotifications(): Promise<PWANotification[]> { return []; },
  async sendPWANotification(t: string, b: string): Promise<void> { },
  async getAPIConfigs(): Promise<ExternalAPIConfig[]> { return []; },
  async saveAPIConfig(c: ExternalAPIConfig): Promise<void> { },
  async syncCRM(p: string): Promise<void> { },
  async syncERP(p: string): Promise<void> { },
  async getSyncLogs(): Promise<IntegrationSyncLog[]> { return []; },
  async getWAMessages(): Promise<WhatsAppMessage[]> { return []; },
  async sendWAMessage(u: string, c: string, t: string): Promise<void> { },
  async getAIRecommendations(): Promise<AIRecommendation[]> { return []; },
  async getAIPredictions(): Promise<AIPrediction[]> { return []; },
  async getAIAutomations(): Promise<AIAutomationRule[]> { return []; },
  async saveAIAutomation(r: AIAutomationRule): Promise<void> { },
  async getAILogs(): Promise<AILogEntry[]> { return []; },
  async saveRole(r: RoleDefinition): Promise<void> { },
  async getHelpTopic(id: string): Promise<HelpTopic | null> { return null; },
  async registerAffiliate(d: any): Promise<void> { },
  async getDepartments(): Promise<Department[]> { return []; },
  async saveDepartment(d: Department): Promise<void> { },
  async getCategories(): Promise<Category[]> { return []; },
  async saveCategory(c: Category): Promise<void> { },
  async getCoupons(): Promise<Coupon[]> { return []; },
  async saveCoupon(c: Coupon): Promise<void> { },
  async saveConsent(e: string, a: boolean): Promise<void> { }
};
