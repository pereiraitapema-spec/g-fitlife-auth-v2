
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
const MASTER_EMAIL = 'pereira.itapema@gmail.com';

export const storeService = {
  async initializeSystem(): Promise<void> {
    if (!supabase) return;
    console.log("[GFIT-SERVICE] Sistema Inicializado.");
  },

  // AUTH & SESSION
  async login(email: string, pass: string) {
    if (!supabase) return { success: false, error: 'Serviço Offline.' };

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: pass
      });

      if (error) {
        if (error.message.toLowerCase().includes('email not confirmed')) {
          return { success: false, error: 'E-mail ainda não verificado. Por favor, cheque sua caixa de entrada.' };
        }
        return { success: false, error: 'Credenciais inválidas.' };
      }
      
      if (data.user) {
        const profile = await this.getProfileAfterLogin(data.user.id);
        if (profile) {
          if (profile.status !== UserStatus.ACTIVE) {
            await supabase.auth.signOut();
            return { success: false, error: 'Conta suspensa.' };
          }
          const session = this.createSession(profile);
          const isStaff = [UserRole.ADMIN_MASTER, UserRole.ADMIN_OPERATIONAL, UserRole.FINANCE, UserRole.MARKETING].includes(profile.role);
          
          return { 
            success: true, 
            session, 
            profile, 
            isStaff,
            mustChangePassword: profile.isDefaultPassword || false 
          };
        }
      }
    } catch (err) {
      return { success: false, error: 'Erro de comunicação.' };
    }
    return { success: false, error: 'Perfil não encontrado.' };
  },

  /**
   * RECUPERAÇÃO DE SENHA (FORGOT PASSWORD)
   * CORREÇÃO DEFINITIVA: Força a remoção de barra final para evitar bloqueio por URL mismatch.
   */
  async recoverPassword(email: string) {
    if (!supabase) {
      console.error('[SUPABASE-DEBUG] Supabase não inicializado.');
      return { success: false, error: 'Offline' };
    }
    
    const cleanEmail = email.trim().toLowerCase();
    
    // window.location.origin geralmente não tem barra, mas o replace(/\/$/, "") garante 100% de segurança
    const redirectUrl = window.location.origin.replace(/\/$/, "");
    
    console.log('[SUPABASE-DEBUG] Solicitando reset para:', cleanEmail);
    console.log('[SUPABASE-DEBUG] URL de retorno higienizada:', redirectUrl);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl,
      });
      
      if (error) {
        console.error('[SUPABASE-DEBUG] Erro API Supabase:', error.message);
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (err: any) {
      console.error('[SUPABASE-DEBUG] Falha de Execução:', err);
      return { success: false, error: err.message || 'Erro ao processar e-mail.' };
    }
  },

  async updatePassword(newPass: string) {
    if (!supabase) return { success: false, error: 'Supabase Offline' };
    try {
      const { error } = await supabase.auth.updateUser({ password: newPass });
      if (error) return { success: false, error: error.message };
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('user_profile').update({ is_default_password: false }).eq('id', user.id);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Falha ao atualizar senha.' };
    }
  },

  async register(email: string, pass: string, name: string) {
    if (!supabase) return { success: false, error: 'Serviço de autenticação offline.' };

    try {
      const isMasterRequest = email.trim().toLowerCase() === MASTER_EMAIL;
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: pass,
        options: {
          data: {
            full_name: name,
            is_master: isMasterRequest
          },
          emailRedirectTo: window.location.origin.replace(/\/$/, "")
        }
      });

      if (error) return { success: false, error: error.message };
      
      return { 
        success: true, 
        user: data.user,
        message: 'Verifique sua caixa de entrada para confirmar o cadastro.' 
      };
    } catch (err) {
      return { success: false, error: 'Erro ao processar registro.' };
    }
  },

  async resendVerificationEmail(email: string) {
    if (!supabase) return { success: false, error: 'Supabase Offline' };
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: window.location.origin.replace(/\/$/, "")
      }
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  async loginWithGoogle() {
    if (!supabase) return { success: false, error: 'Auth Social Inativo.' };
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin.replace(/\/$/, "") }
      });
      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Falha Google Auth.' };
    }
  },

  async getProfileAfterLogin(userId: string): Promise<AppUser | null> {
    if (!supabase) return null;
    
    let { data: profile } = await supabase.from('user_profile').select('*').eq('id', userId).maybeSingle();
    
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return profile ? this.normalizeProfile(profile) : null;

    const email = authUser.email?.toLowerCase();
    const isMasterEmail = email === MASTER_EMAIL;

    if (profile) {
      if (isMasterEmail && profile.role !== UserRole.ADMIN_MASTER) {
        const { data: updated } = await supabase.from('user_profile')
          .update({ role: UserRole.ADMIN_MASTER })
          .eq('id', userId)
          .select()
          .single();
        return this.normalizeProfile(updated);
      }
      return this.normalizeProfile(profile);
    }

    const newProfileData = {
      id: authUser.id,
      email: email,
      name: authUser.user_metadata?.full_name || (isMasterEmail ? 'Master Admin' : 'Membro G-Fit'),
      role: isMasterEmail ? UserRole.ADMIN_MASTER : UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      login_type: 'hybrid',
      is_default_password: !authUser.app_metadata.provider || authUser.app_metadata.provider === 'email', 
      created_at: new Date().toISOString()
    };
    
    const { data: created } = await supabase.from('user_profile').insert(newProfileData).select().single();
    return this.normalizeProfile(created);
  },

  normalizeProfile(p: any): AppUser {
    return {
      id: p.id,
      email: p.email,
      name: p.name,
      role: p.role as UserRole,
      status: p.status as UserStatus,
      createdAt: p.created_at,
      isDefaultPassword: p.is_default_password,
      loginType: p.login_type
    };
  },

  createSession(u: AppUser): UserSession {
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

  async generateTrackingLink(affiliateId: string, productId: string) {
    if (!supabase) return { success: false, error: 'Offline' };
    try {
      const slug = Math.random().toString(36).substring(2, 10).toUpperCase();
      const { data, error } = await supabase.from('tracking_links').insert({
        affiliate_id: affiliateId,
        product_id: productId,
        slug: slug,
        visits: 0
      }).select().single();

      if (error) throw error;
      return { success: true, link: data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getTrackingLinks(affiliateId: string) {
    if (!supabase) return [];
    const { data } = await supabase.from('tracking_links')
      .select('*, products(name)')
      .eq('affiliate_id', affiliateId)
      .order('created_at', { ascending: false });
    return data || [];
  },

  async getSettings(): Promise<SystemSettings> {
    if (supabase) {
      const { data } = await supabase.from('core_settings').select('*').eq('key', 'geral').maybeSingle();
      if (data) {
        return {
          nomeLoja: data.nome_loja,
          logoUrl: data.logo_url,
          emailContato: data.email_contato,
          telefone: data.telefone,
          whatsapp: data.whatsapp,
          dominio: data.dominio,
          moeda: data.moeda,
          timezone: data.timezone,
          companyName: data.company_name,
          storeName: data.store_name,
          adminEmail: data.admin_email,
          systemStatus: data.system_status,
          environment: data.environment,
          privacyPolicy: data.privacy_policy,
          termsOfUse: data.terms_of_use,
          pwaInstalledCount: 0,
          pwaVersion: data.pwa_version,
          pushNotificationsActive: true,
          language: data.language,
          currency: data.currency
        } as SystemSettings;
      }
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
    const dbData = {
      key: 'geral',
      nome_loja: settings.nomeLoja,
      logo_url: settings.logoUrl,
      email_contato: settings.emailContato,
      telefone: settings.telefone,
      whatsapp: settings.whatsapp,
      dominio: settings.dominio,
      moeda: settings.moeda,
      timezone: settings.timezone,
      company_name: settings.companyName,
      store_name: settings.storeName,
      admin_email: settings.adminEmail,
      system_status: settings.systemStatus,
      environment: settings.environment,
      privacy_policy: settings.privacyPolicy,
      terms_of_use: settings.termsOfUse,
      pwa_version: settings.pwaVersion,
      language: settings.language,
      currency: settings.currency
    };
    await supabase.from('core_settings').upsert(dbData);
    window.dispatchEvent(new Event('systemSettingsChanged'));
  },

  async getUsers(): Promise<AppUser[]> {
    if (!supabase) return [];
    const { data } = await supabase.from('user_profile').select('*').order('created_at', { ascending: false });
    return (data || []).map(u => this.normalizeProfile(u));
  },

  async saveUser(user: AppUser): Promise<void> {
    if (!supabase) return;
    const dbUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      login_type: user.loginType,
      is_default_password: user.isDefaultPassword,
      created_at: user.createdAt
    };
    const { error } = await supabase.from('user_profile').upsert(dbUser);
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

  async getDepartments(): Promise<Department[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('departments').select('*');
    return data || [];
  },
  async saveDepartment(d: Department): Promise<void> { 
    if (!supabase) return;
    await supabase.from('departments').upsert(d);
    window.dispatchEvent(new Event('departmentsChanged'));
  },
  async getCategories(): Promise<Category[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('categories').select('*');
    return data || [];
  },
  async saveCategory(c: Category): Promise<void> { 
    if (!supabase) return;
    await supabase.from('categories').upsert(c);
    window.dispatchEvent(new Event('categoriesChanged'));
  },

  async getBanners(): Promise<Banner[]> {
    if (!supabase) return [];
    const { data } = await supabase.from('banners').select('*').order('id');
    return data || [];
  },
  async saveBanner(banner: Banner): Promise<void> {
    if (!supabase) return;
    await supabase.from('banners').upsert(banner);
    window.dispatchEvent(new Event('bannersChanged'));
  },
  async getCoupons(): Promise<Coupon[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('coupons').select('*');
    return data || [];
  },
  async saveCoupon(c: Coupon): Promise<void> { 
    if (!supabase) return;
    await supabase.from('coupons').upsert(c);
    window.dispatchEvent(new Event('couponsChanged'));
  },
  async getAffiliates(): Promise<Affiliate[]> {
    if (!supabase) return [];
    const { data } = await supabase.from('affiliates').select('*');
    return data || [];
  },
  async approveAffiliate(userId: string): Promise<void> {
    if (!supabase) return;
    await supabase.from('user_profile').update({ role: UserRole.ADMIN_MASTER }).eq('id', userId);
    await supabase.from('affiliates').update({ status: 'active' }).eq('userId', userId);
    window.dispatchEvent(new Event('usersChanged'));
  },
  async registerAffiliate(d: any): Promise<void> { 
    if (!supabase) return;
    const newAffiliate = {
      id: 'aff-' + Date.now(),
      userId: d.email, 
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
  async getCommissions(): Promise<Commission[]> {
    if (!supabase) return [];
    const { data } = await supabase.from('commissions').select('*').order('created_at', { ascending: false });
    return data || [];
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

  async getSystemLogs(): Promise<SystemLog[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('system_logs').select('*').order('timestamp', { ascending: false }).limit(50);
    return data || [];
  },
  async getAuditLogs(): Promise<AuditLog[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false });
    return data || [];
  },
  async getLGPDLogs(): Promise<LGPDLog[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('lgpd_logs').select('*').order('timestamp', { ascending: false });
    return data || [];
  },
  async getConsents(): Promise<LGPDConsent[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('lgpd_consents').select('*').order('timestamp', { ascending: false });
    return data || [];
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

  async getSessions(): Promise<UserSession[]> { 
    const active = this.getActiveSession();
    return active ? [active] : [];
  },
  async getDeploys(): Promise<DeployRecord[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('deploy_records').select('*').order('timestamp', { ascending: false });
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
    const { data } = await supabase.from('backup_records').select('*').order('timestamp', { ascending: false });
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
  async getAPIConfigs(): Promise<ExternalAPIConfig[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('external_api_configs').select('*');
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
    const { data } = await supabase.from('ai_log_entries').select('*').order('timestamp', { ascending: false });
    return data || [];
  },

  async getCarriers(): Promise<Carrier[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('carriers').select('*');
    return data || [];
  },
  async getDeliveries(): Promise<Delivery[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('deliveries').select('*').order('estimated_date', { ascending: false });
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
    const { data } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
    return data || [];
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
  async getHelpTopic(id: string): Promise<HelpTopic | null> { 
    if (!supabase) return null;
    const { data } = await supabase.from('help_topics').select('*').eq('id', id).maybeSingle();
    return data;
  },
  async saveRole(role: RoleDefinition): Promise<void> { 
    if (!supabase) return;
    await supabase.from('roles').upsert(role);
  },

  async uploadFile(file: File): Promise<string> {
    if (!supabase) throw new Error('Supabase Inacessível.');
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      console.error('Erro: Usuário não autenticado para upload');
      alert('Faça login novamente antes de enviar a imagem');
      throw new Error('Usuário não logado');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `public/${fileName}`;
    const { data, error: uploadError } = await supabase.storage.from('uploads').upload(filePath, file);
    
    if (uploadError) {
      console.error('Erro no upload:', uploadError);
      throw new Error(`Falha no upload: ${uploadError.message}`);
    }
    
    const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(filePath);
    return publicUrl;
  },

  async createAdminUser(adminData: any): Promise<void> {
    const response = await fetch('/auth/register', {
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
    const { error } = await supabase.from('user_profile').delete().eq('id', id);
    if (error) throw error;
    window.dispatchEvent(new Event('usersChanged'));
    return true;
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

  async getLeads(): Promise<Lead[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('leads').select('*');
    return data || [];
  },

  async getPerformanceMetrics(): Promise<PerformanceMetric[]> { 
    if (!supabase) return [];
    const { data } = await supabase.from('performance_metrics').select('*');
    return data || [];
  },

  async getRemarketingLogs(): Promise<RemarketingLog[]> {
    if (!supabase) return [];
    const { data } = await supabase.from('remarketing_logs').select('*').order('sentAt', { ascending: false });
    return data || [];
  },
  async getTemplates(): Promise<EmailTemplate[]> {
    if (!supabase) return [];
    const { data } = await supabase.from('email_templates').select('*');
    return data || [];
  },
  async triggerRemarketing(lead: Lead): Promise<void> {
    if (!supabase) return;
    const log: RemarketingLog = {
      id: 'rem-' + Date.now(),
      leadEmail: lead.email,
      productName: lead.productName,
      sentAt: new Date().toISOString(),
      status: 'sent'
    };
    await supabase.from('remarketing_logs').insert(log);
  },

  async getChatSessions(): Promise<AIChatSession[]> {
    if (!supabase) return [];
    const { data } = await supabase.from('chat_sessions').select('*').order('createdAt', { ascending: false });
    return data || [];
  },
  async updateChatStatus(id: string, status: 'active' | 'escalated' | 'closed'): Promise<void> {
    if (!supabase) return;
    await supabase.from('chat_sessions').update({ status }).eq('id', id);
  },

  async updateMyCredentials(userId: string, email: string, password?: string): Promise<boolean> {
    if (!supabase) return false;
    const updateData: any = { email };
    if (password) updateData.password = password;
    const { error } = await supabase.auth.updateUser(updateData);
    if (error) return false;
    await supabase.from('user_profile').update({ email }).eq('id', userId);
    return true;
  },
  async getSecurityEvents(): Promise<SecurityEvent[]> {
    if (!supabase) return [];
    const { data } = await supabase.from('security_events').select('*').order('timestamp', { ascending: false });
    return data || [];
  },

  async updateEnvironment(environment: 'production' | 'staging' | 'development'): Promise<void> {
    if (!supabase) return;
    await supabase.from('core_settings').update({ environment }).eq('key', 'geral');
    window.dispatchEvent(new Event('systemSettingsChanged'));
  },

  getUserPersonalData(email: string): any {
    return { user: { email }, orders: [], leads: [] };
  },
  async deleteUserPersonalData(email: string): Promise<void> {
    if (!supabase) return;
    await supabase.from('user_profile').delete().eq('email', email);
    await supabase.from('orders').delete().eq('customerEmail', email);
    await supabase.from('leads').delete().eq('email', email);
    await this.logLGPD('data_deletion', email, 'Usuário solicitou exclusão definitiva de dados.');
  },

  getPWAMetrics(): any {
    return { installs: 124, activeUsersMobile: 86, version: '1.2.0' };
  },
  async getPWANotifications(): Promise<PWANotification[]> {
    if (!supabase) return [];
    const { data } = await supabase.from('pwa_notifications').select('*').order('sentAt', { ascending: false });
    return data || [];
  },
  async sendPWANotification(title: string, body: string): Promise<void> {
    if (!supabase) return;
    const notif: PWANotification = {
      id: 'pwa-' + Date.now(),
      title,
      body,
      sentAt: new Date().toISOString(),
      deliveredCount: 124
    };
    await supabase.from('pwa_notifications').insert(notif);
  },

  async syncCRM(provider: string): Promise<void> {
    if (!supabase) return;
    await supabase.from('external_api_configs').update({ lastSync: new Date().toISOString() }).eq('provider', provider);
  },
  async syncERP(provider: string): Promise<void> {
    if (!supabase) return;
    await supabase.from('external_api_configs').update({ lastSync: new Date().toISOString() }).eq('provider', provider);
  },
  async getSyncLogs(): Promise<IntegrationSyncLog[]> {
    if (!supabase) return [];
    const { data } = await supabase.from('sync_logs').select('*').order('timestamp', { ascending: false });
    return data || [];
  },

  async getWAMessages(): Promise<WhatsAppMessage[]> {
    if (!supabase) return [];
    const { data } = await supabase.from('wa_messages').select('*').order('timestamp', { ascending: false });
    return data || [];
  },
  async sendWAMessage(userEmail: string, content: string, trigger: string): Promise<void> {
    if (!supabase) return;
    const msg: WhatsAppMessage = {
      id: 'wa-' + Date.now(),
      userEmail,
      content,
      trigger: trigger as any,
      status: 'sent',
      timestamp: new Date().toISOString()
    };
    await supabase.from('wa_messages').insert(msg);
  }
};
