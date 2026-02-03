import { 
  Order, Lead, Product, Coupon, OrderStatus, 
  AppUser, Department, Category, SystemSettings, 
  UserRole, UserStatus, UserSession, Affiliate, Commission, Banner, EmailTemplate, RemarketingLog, AIChatSession, PerformanceMetric, SystemLog, PaymentGateway, Transaction, Carrier, Delivery, AuditLog, SecurityEvent, DeployRecord, BackupRecord, InfraMetric, Seller, LGPDConsent, LGPDLog, PWANotification, ExternalAPIConfig, IntegrationSyncLog, WhatsAppMessage, AIRecommendation, AIPrediction, AIAutomationRule, AILogEntry, HelpTopic, RoleDefinition
} from '../types';
import { dbStore } from './db';
import { supabase } from '../backend/supabaseClient';

const KEY_SESSION = 'auth_session';

export const storeService = {
  async initializeSystem(): Promise<void> {
    try {
      // 1. Tentar carregar configurações (Remoto -> Local -> Default)
      let remoteConfig = null;
      if (supabase) {
        const { data } = await supabase.from('core_settings').select('*').eq('key', 'geral').single();
        remoteConfig = data;
      }

      if (remoteConfig) {
        await dbStore.put('config', remoteConfig);
      } else {
        const localConfig = await dbStore.getByKey<any>('config', 'geral');
        if (!localConfig) {
          const defaultConfig = {
            key: 'geral',
            nomeLoja: 'G-FitLife Enterprise',
            logoUrl: 'https://picsum.photos/seed/gfitlife/400/400',
            emailContato: 'enterprise@gfitlife.io',
            moeda: 'BRL',
            environment: 'production',
            storeName: 'G-FitLife Store',
            adminEmail: 'admin@gfitlife.io',
            companyName: 'G-FitLife Inc.',
            systemStatus: 'online',
            language: 'pt-BR',
            currency: 'BRL',
            privacyPolicy: 'Política LGPD G-FitLife...',
            termsOfUse: 'Termos de uso corporativos...',
            timezone: 'America/Sao_Paulo',
            dominio: 'gfitlife.io',
            telefone: '(11) 4004-GFIT',
            whatsapp: '(11) 99999-0000'
          };
          await dbStore.put('config', defaultConfig);
        }
      }

      // 2. Seed de Dados Básicos no LocalDB
      const checkAndSeed = async (storeName: string, defaultData: any[]) => {
        const existing = await dbStore.getAll(storeName);
        if (existing.length === 0) {
          for (const item of defaultData) {
            await dbStore.put(storeName, item);
          }
        }
      };

      await checkAndSeed('departments', [
        { id: 'dept-1', name: 'Suplementação', status: 'active' },
        { id: 'dept-2', name: 'Equipamentos', status: 'active' }
      ]);

      await checkAndSeed('ai_predictions', [
        { id: 'pred-1', period: 'Jul/2024', projectedSales: 125000, confidence: 94, insights: ['Alta demanda corporativa'] }
      ]);

      // 3. Sincronização de Usuários (Se Supabase ativo)
      if (supabase) {
        const { data: remoteUsers } = await supabase.from('users_profile').select('*');
        if (remoteUsers) {
          for (const u of remoteUsers) {
            await dbStore.put('users', u);
          }
        }
      }
    } catch (err) {
      console.warn("Sincronização limitada (Modo local ativo):", err);
    }
  },

  async login(email: string, pass: string) {
    // Tenta Supabase primeiro
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: pass
        });

        if (!error && data.user) {
          const { data: profile } = await supabase
            .from('users_profile')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile) {
            const session = this.createSession(profile);
            return { success: true, session, forcePasswordChange: profile.isDefaultPassword };
          }
        }
      } catch (err) {
        console.error("Erro auth remota:", err);
      }
    }
    
    // Fallback Offline/Master Local
    if (email === 'admin@system.local' && pass === 'admin123') {
      const fallbackAdmin = { id: 'master-0', name: 'G-FitLife Master', email, role: UserRole.ADMIN_MASTER, status: UserStatus.ACTIVE };
      return { success: true, session: this.createSession(fallbackAdmin) };
    }
    
    return { success: false, error: 'Credenciais inválidas ou serviço indisponível.' };
  },

  async loginWithGoogle() {
    if (!supabase) return { success: false, error: 'Serviço de autenticação remota não configurado.' };
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  async getProfileAfterLogin(userId: string) {
     if (!supabase) return null;
     const { data: profile } = await supabase.from('users_profile').select('*').eq('id', userId).single();
     return profile;
  },

  async createAdminUser(userData: any) {
    const response = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Falha ao criar usuário');
    window.dispatchEvent(new Event('usersChanged'));
    return result;
  },

  async deleteAdminUser(userId: string) {
    const response = await fetch('/api/admin/delete-user', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Falha ao excluir');
    window.dispatchEvent(new Event('usersChanged'));
    return result;
  },

  async updateAdminCredentials(userId: string, email: string, pass: string): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error: authError } = await supabase.auth.updateUser({ email: email.trim().toLowerCase(), password: pass });
      if (authError) throw authError;
      const { error: profileError } = await supabase.from('users_profile').update({ email: email.trim().toLowerCase() }).eq('id', userId);
      if (profileError) throw profileError;
      return true;
    } catch (err) {
      console.error("Erro ao atualizar credenciais:", err);
      return false;
    }
  },

  async saveUser(u: AppUser): Promise<void> {
    await dbStore.put('users', u);
    if (supabase) {
      await supabase.from('users_profile').upsert({
        id: u.id, name: u.name, email: u.email, role: u.role, status: u.status, updated_at: new Date().toISOString()
      });
    }
    window.dispatchEvent(new Event('usersChanged'));
  },

  async saveSettings(s: SystemSettings): Promise<void> {
    await dbStore.put('config', { ...s, key: 'geral' });
    if (supabase) {
      await supabase.from('core_settings').upsert({ ...s, key: 'geral' });
    }
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
    return s;
  },

  getActiveSession(): UserSession | null {
    const saved = sessionStorage.getItem(KEY_SESSION);
    if (!saved) return null;
    return JSON.parse(saved);
  },

  updateSessionRole(role: UserRole) {
    const session = this.getActiveSession();
    if (session) {
      session.userRole = role;
      sessionStorage.setItem(KEY_SESSION, JSON.stringify(session));
      window.dispatchEvent(new Event('sessionUpdated'));
    }
  },

  logout(): void {
    sessionStorage.removeItem(KEY_SESSION);
    if (supabase) supabase.auth.signOut();
  },

  async getSettings(): Promise<SystemSettings> {
    const data = await dbStore.getByKey<any>('config', 'geral');
    return data as SystemSettings;
  },

  async getUsers(): Promise<AppUser[]> {
    if (supabase) {
      const { data: remoteUsers } = await supabase.from('users_profile').select('*');
      if (remoteUsers) return remoteUsers as AppUser[];
    }
    return await dbStore.getAll<AppUser>('users');
  },

  async getProducts(): Promise<Product[]> { return await dbStore.getAll<Product>('products'); },
  async getOrders(): Promise<Order[]> { return await dbStore.getAll<Order>('orders'); },
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

  async uploadFile(file: File): Promise<string> {
    if (!supabase) return URL.createObjectURL(file); // Fallback local preview
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `public/${fileName}`;
    const { error } = await supabase.storage.from('media').upload(filePath, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);
    return publicUrl;
  },

  async updateUserStatus(id: string, status: UserStatus): Promise<void> {
    if (supabase) await supabase.from('users_profile').update({ status }).eq('id', id);
    window.dispatchEvent(new Event('usersChanged'));
  },

  async deleteUser(id: string): Promise<boolean> {
    if (supabase) {
      const { data: user } = await supabase.from('users_profile').select('*').eq('id', id).single();
      if (user && user.email === 'admin@system.local') return false;
      await supabase.from('users_profile').delete().eq('id', id);
    }
    window.dispatchEvent(new Event('usersChanged'));
    return true;
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
  async getAffiliates(): Promise<Affiliate[]> { return await dbStore.getAll<Affiliate>('affiliates'); },
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
  async getAuditLogs(): Promise<AuditLog[]> { return await dbStore.getAll<AuditLog>('audit_logs'); },
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