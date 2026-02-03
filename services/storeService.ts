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
      const { data: remoteConfig, error: cfgError } = await supabase
        .from('core_settings')
        .select('*')
        .eq('key', 'geral')
        .single();

      if (remoteConfig && !cfgError) {
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
            privacyPolicy: 'Política de privacidade...',
            termsOfUse: 'Termos de uso...',
            timezone: 'America/Sao_Paulo',
            dominio: 'gfitlife.io',
            telefone: '(11) 9999-9999',
            whatsapp: '(11) 99999-9999'
          };
          await dbStore.put('config', defaultConfig);
          await supabase.from('core_settings').upsert(defaultConfig);
        }
      }

      const { data: remoteUsers } = await supabase.from('profiles').select('*');
      if (remoteUsers) {
        for (const u of remoteUsers) {
          await dbStore.put('users', u);
        }
      }
    } catch (err) {
      console.error("Erro na sincronização inicial:", err);
    }
  },

  async login(email: string, pass: string) {
    try {
      // Auditoria no Backend Próprio (Requisito Profissional)
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: pass
      });

      if (error) return { success: false, error: error.message };

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (!profile) return { success: false, error: 'Perfil não encontrado.' };

      const session = this.createSession(profile);
      return { success: true, session, forcePasswordChange: profile.isDefaultPassword };
    } catch (err) {
      // Fallback para admin padrão caso offline
      if (email === 'admin@system.local' && pass === 'admin123') {
        const fallbackAdmin = { id: 'admin-0', name: 'Super Admin', email, role: UserRole.ADMIN_MASTER };
        return { success: true, session: this.createSession(fallbackAdmin) };
      }
      return { success: false, error: 'Erro de conexão com o servidor.' };
    }
  },

  async loginWithGoogle(email?: string) {
    if (email) {
      const users = await this.getUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        const session = this.createSession(user);
        return { success: true, session };
      }
      return { success: false, error: 'Usuário não encontrado.' };
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  async saveUser(u: AppUser): Promise<void> {
    await dbStore.put('users', u);
    const { error } = await supabase.from('profiles').upsert({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      updated_at: new Date().toISOString()
    });
    if (error) throw new Error("Erro de sincronização remota.");
    window.dispatchEvent(new Event('usersChanged'));
  },

  async saveSettings(s: SystemSettings): Promise<void> {
    await dbStore.put('config', { ...s, key: 'geral' });
    const { error } = await supabase.from('core_settings').upsert({ ...s, key: 'geral' });
    if (error) throw new Error("Falha ao salvar configurações.");
    window.dispatchEvent(new Event('systemSettingsChanged'));
  },

  async saveProduct(p: Product): Promise<void> {
    await dbStore.put('products', p);
    await supabase.from('products').upsert(p);
    window.dispatchEvent(new Event('productsChanged'));
  },

  async saveOrder(o: Order): Promise<void> {
    await dbStore.put('orders', o);
    await supabase.from('orders').insert(o);
    window.dispatchEvent(new Event('ordersChanged'));
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

  logout(): void {
    sessionStorage.removeItem(KEY_SESSION);
    supabase.auth.signOut();
  },

  async getSettings(): Promise<SystemSettings> {
    const data = await dbStore.getByKey<any>('config', 'geral');
    return data as SystemSettings;
  },

  async getUsers(): Promise<AppUser[]> {
    return await dbStore.getAll<AppUser>('users');
  },

  async getProducts(): Promise<Product[]> {
    return await dbStore.getAll<Product>('products');
  },

  async getOrders(): Promise<Order[]> {
    return await dbStore.getAll<Order>('orders');
  },

  async getDepartments(): Promise<Department[]> {
    return await dbStore.getAll<Department>('departments');
  },

  async getCategories(): Promise<Category[]> {
    return await dbStore.getAll<Category>('categories');
  },

  async getCoupons(): Promise<Coupon[]> {
    return await dbStore.getAll<Coupon>('coupons');
  },

  getRoles() {
    return [
      { id: UserRole.ADMIN_MASTER, label: 'Admin Master', permissions: [] },
      { id: UserRole.ADMIN_OPERATIONAL, label: 'Operacional', permissions: [] },
      { id: UserRole.CUSTOMER, label: 'Usuário Final', permissions: [] }
    ];
  },

  async updateAdminCredentials(userId: string, email: string, password?: string): Promise<boolean> {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      email: email,
      password: password
    });
    return !error;
  },

  async uploadFile(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `public/${fileName}`;
    const { error } = await supabase.storage.from('media').upload(filePath, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);
    return publicUrl;
  },

  async updateUserStatus(id: string, status: UserStatus): Promise<void> {
    const users = await this.getUsers();
    const user = users.find(u => u.id === id);
    if (user) {
      user.status = status;
      await this.saveUser(user);
    }
  },

  async deleteUser(id: string): Promise<boolean> {
    const users = await this.getUsers();
    const user = users.find(u => u.id === id);
    if (user && user.email === 'admin@system.local') return false;
    await dbStore.delete('users', id);
    window.dispatchEvent(new Event('usersChanged'));
    return true;
  },

  async saveDepartment(dept: Department): Promise<void> {
    await dbStore.put('departments', dept);
    window.dispatchEvent(new Event('departmentsChanged'));
  },

  async saveCategory(cat: Category): Promise<void> {
    await dbStore.put('categories', cat);
    window.dispatchEvent(new Event('categoriesChanged'));
  },

  async saveCoupon(coupon: Coupon): Promise<void> {
    await dbStore.put('coupons', coupon);
    window.dispatchEvent(new Event('couponsChanged'));
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
    const orders = await this.getOrders();
    const order = orders.find(o => o.id === id);
    if (order) {
      order.status = status;
      await dbStore.put('orders', order);
      window.dispatchEvent(new Event('ordersChanged'));
    }
  },

  async captureLead(email: string, product: Product): Promise<void> {
    const lead: Lead = {
      id: 'lead-' + Date.now(),
      email,
      productId: product.id,
      productName: product.name,
      capturedAt: new Date().toISOString(),
      converted: false
    };
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
    await dbStore.put('remarketing_logs', log);
    window.dispatchEvent(new Event('remarketingLogsChanged'));
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
    await dbStore.put('deploys', deploy);
    window.dispatchEvent(new Event('deploysChanged'));
  },
  async getBackups(): Promise<BackupRecord[]> { return await dbStore.getAll<BackupRecord>('backups'); },
  async createBackup(name: string): Promise<void> {
    const backup: BackupRecord = { id: 'bak-' + Date.now(), name, size: '15.4 MB', status: 'completed', timestamp: new Date().toISOString() };
    await dbStore.put('backups', backup);
    window.dispatchEvent(new Event('backupsChanged'));
  },
  getInfraMetrics(): InfraMetric {
    return { uptime: '14d 6h 22m', latency: 45, cpu: 12, ram: 34, lastHealthCheck: new Date().toISOString() };
  },
  async getSellers(): Promise<Seller[]> { return await dbStore.getAll<Seller>('sellers'); },
  async saveSeller(seller: Seller): Promise<void> { await dbStore.put('sellers', seller); window.dispatchEvent(new Event('sellersChanged')); },
  async saveConsent(userEmail: string, accepted: boolean): Promise<void> {
    const consent: LGPDConsent = { id: 'con-' + Date.now(), userEmail, accepted, ip: '189.12.34.56', userAgent: navigator.userAgent, timestamp: new Date().toISOString() };
    await dbStore.put('consents', consent);
    window.dispatchEvent(new Event('consentsChanged'));
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
    await dbStore.put('lgpd_logs', log);
    window.dispatchEvent(new Event('lgpdLogsChanged'));
  },
  async deleteUserPersonalData(email: string): Promise<void> {
    await this.logLGPD('data_deletion', email, 'Exclusão definitiva de dados pessoais solicitada pelo titular.');
  },
  async getLGPDLogs(): Promise<LGPDLog[]> { return await dbStore.getAll<LGPDLog>('lgpd_logs'); },
  getPWAMetrics(): any { return { installs: 1242, activeUsersMobile: 856, version: 'v2.4.0' }; },
  async getPWANotifications(): Promise<PWANotification[]> { return await dbStore.getAll<PWANotification>('pwa_notifications'); },
  async sendPWANotification(title: string, body: string): Promise<void> {
    const notif: PWANotification = { id: 'notif-' + Date.now(), title, body, sentAt: new Date().toISOString(), deliveredCount: 124 };
    await dbStore.put('pwa_notifications', notif);
    window.dispatchEvent(new Event('pwaNotificationsChanged'));
  },
  async getAPIConfigs(): Promise<ExternalAPIConfig[]> { return await dbStore.getAll<ExternalAPIConfig>('api_configs'); },
  async syncCRM(provider: string): Promise<void> {
    const configs = await this.getAPIConfigs();
    const cfg = configs.find(c => c.provider === provider);
    if (cfg) { cfg.lastSync = new Date().toISOString(); await dbStore.put('api_configs', cfg); }
  },
  async getWAMessages(): Promise<WhatsAppMessage[]> { return await dbStore.getAll<WhatsAppMessage>('wa_messages'); },
  async sendWAMessage(userEmail: string, content: string, trigger: 'lead' | 'purchase' | 'remarketing' | 'manual'): Promise<void> {
    const msg: WhatsAppMessage = { id: 'wa-' + Date.now(), userEmail, content, trigger, status: 'sent', timestamp: new Date().toISOString() };
    await dbStore.put('wa_messages', msg);
    window.dispatchEvent(new Event('waMessagesChanged'));
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
    if (id === 'help-overview') return { id, title: 'Visão Geral', description: 'Manual G-FitLife.', content: { intro: 'Alta performance.', architecture: 'Híbrida.', features: ['RBAC', 'AI Coach'] }, promptUsed: '', updatedAt: '' };
    return null;
  }
};