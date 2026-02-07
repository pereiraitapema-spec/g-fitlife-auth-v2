
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import HeaderSimple from './components/HeaderSimple';
import PublicHeader from './components/PublicHeader';
import PublicFooter from './components/PublicFooter';
import Dashboard from './pages/Dashboard';
import CoreSettings from './pages/CoreSettings';
import CoreUsers from './pages/CoreUsers';
import CoreRoles from './pages/CoreRoles';
import HelpOverview from './pages/HelpOverview';
import HelpCoreDetail from './pages/HelpCoreDetail';
import ProductsCatalog from './pages/ProductsCatalog';
import OrdersPage from './pages/OrdersPage';
import PublicCatalog from './pages/PublicCatalog';
import CheckoutPage from './pages/CheckoutPage';
import PublicHome from './pages/PublicHome';
import PublicDepartments from './pages/PublicDepartments';
import Departments from './pages/Departments';
import CategoriesPage from './pages/CategoriesPage';
import CouponsPage from './pages/CouponsPage';
import PublicContact from './pages/PublicContact';
import PublicAffiliateRegister from './pages/PublicAffiliateRegister';
import PublicFavorites from './pages/PublicFavorites';
import AffiliatePortal from './pages/AffiliatePortal';
import CustomerPortal from './pages/CustomerPortal';
import AICoach from './components/AICoach';
import LGPDBanner from './components/LGPDBanner';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Modulos Adicionais
import MarketingBanners from './pages/MarketingBanners';
import MarketingRemarketing from './pages/MarketingRemarketing';
import MarketingChatIA from './pages/MarketingChatIA';
import SEOOnPage from './pages/SEOOnPage';
import SEOTechnical from './pages/SEOTechnical';
import SEOPerformance from './pages/SEOPerformance';
import SEOMonitoring from './pages/SEOMonitoring';
import FinancePayments from './pages/FinancePayments';
import FinanceTransactions from './pages/FinanceTransactions';
import FinanceReports from './pages/FinanceReports';
import LogisticsCarriers from './pages/LogisticsCarriers';
import LogisticsRates from './pages/LogisticsRates';
import LogisticsDeliveries from './pages/LogisticsDeliveries';
import MarketplaceSellers from './pages/MarketplaceSellers';
import MarketplaceProducts from './pages/MarketplaceProducts';
import MarketplaceOrders from './pages/MarketplaceOrders';
import MarketplaceFinance from './pages/MarketplaceFinance';
import AffiliatesOverview from './pages/AffiliatesOverview';
import AffiliatesCommissions from './pages/AffiliatesCommissions';
import AffiliatesLinks from './pages/AffiliatesLinks';
import AffiliatesReports from './pages/AffiliatesReports';
import LGPDConsentPage from './pages/LGPDConsentPage';
import LGPDUserDataPage from './pages/LGPDUserDataPage';
import LGPDLogsPage from './pages/LGPDLogsPage';
import LGPDPoliciesPage from './pages/LGPDPoliciesPage';
import PWASettings from './pages/PWASettings';
import PWAInstallation from './pages/PWAInstallation';
import PWANotifications from './pages/PWANotifications';
import IntegrationAPIs from './pages/IntegrationAPIs';
import IntegrationCRM from './pages/IntegrationCRM';
import IntegrationWhatsApp from './pages/IntegrationWhatsApp';
import IntegrationERP from './pages/IntegrationERP';
import AIRecommendations from './pages/AIRecommendations';
import AIPredictions from './pages/AIPredictions';
import AIAutomations from './pages/AIAutomations';
import AILogs from './pages/AILogs';
import SecurityAuth from './pages/SecurityAuth';
import SecurityPermissions from './pages/SecurityPermissions';
import SecurityAudit from './pages/SecurityAudit';
import SecurityLogs from './pages/SecurityLogs';
import InfraEnvironment from './pages/InfraEnvironment';
import InfraDeploy from './pages/InfraDeploy';
import InfraBackup from './pages/InfraBackup';
import InfraMonitoring from './pages/InfraMonitoring';

import { storeService } from './services/storeService';
import { UserSession, Product, UserRole, UserStatus, Route } from './types';
import { supabase } from './backend/supabaseClient';

const App: React.FC = () => {
  const [isSystemReady, setIsSystemReady] = useState(false);
  const [session, setSession] = useState<UserSession | null>(null);
  const [currentRoute, setCurrentRoute] = useState<Route>('public-home');
  const [viewMode, setViewMode] = useState<'store' | 'admin'>('store');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [cart, setCart] = useState<Product[]>([]);
  const [feedback, setFeedback] = useState<{message: string, type: 'success' | 'error' | 'warning'} | null>(null);
  
  // Login & Recovery states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false); // Modal Solicitação
  const [isResetPasswordView, setIsResetPasswordView] = useState(false); // View de Redefinição Real
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const triggerFeedback = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleRoleLanding = (role: UserRole) => {
    const staffRoles = [UserRole.ADMIN_MASTER, UserRole.ADMIN_OPERATIONAL, UserRole.FINANCE, UserRole.MARKETING, UserRole.SELLER];
    if (staffRoles.includes(role)) {
      setViewMode('admin');
      setCurrentRoute('dashboard');
    } else if (role === UserRole.AFFILIATE) {
      setViewMode('store');
      setCurrentRoute('affiliate-portal');
    } else {
      setViewMode('store');
      setCurrentRoute('customer-portal');
    }
  };

  const syncAuth = async () => {
    if (!supabase) return;
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (currentSession) {
        const profile = await storeService.getProfileAfterLogin(currentSession.user.id);
        if (profile) {
          if (profile.status === UserStatus.ACTIVE) {
            const newSession = storeService.createSession(profile);
            setSession(newSession);

            // CRÍTICO: Verificamos se há um hash de recuperação ANTES de qualquer redirecionamento
            const hasRecoveryHash = window.location.hash.includes('type=recovery') || 
                                   window.location.hash.includes('type=invite') ||
                                   window.location.hash.includes('type=magiclink');

            if (!isResetPasswordView && !hasRecoveryHash) {
               if (profile.isDefaultPassword) setMustChangePassword(true);
               else handleRoleLanding(profile.role);
            } else if (hasRecoveryHash) {
               // Forçamos a rota de redefinição se o token estiver presente
               setIsResetPasswordView(true);
               setCurrentRoute('reset-password');
            }
          } else {
            setAuthError('Conta inativa.');
            await supabase.auth.signOut();
          }
        }
      }
    } catch (e) {
      console.error("[GFIT-APP] Erro crítico em syncAuth:", e);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await storeService.initializeSystem();
        
        // Detecção prévia de hash de recuperação para evitar flashes de outras telas
        if (window.location.hash.includes('type=recovery') || 
            window.location.hash.includes('type=invite') ||
            window.location.hash.includes('type=magiclink')) {
          setIsResetPasswordView(true);
          setCurrentRoute('reset-password');
        }

        await syncAuth();
      } catch (e) {
        console.error("[GFIT-APP] Falha na inicialização do sistema:", e);
      } finally {
        setIsSystemReady(true);
      }
    };
    init();

    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log(`[GFIT-AUTH] Evento: ${event}`);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          syncAuth();
        }
        if (event === 'PASSWORD_RECOVERY') {
          console.log('[GFIT-AUTH] Fluxo de Recuperação Detectado via Evento.');
          setIsResetPasswordView(true);
          setCurrentRoute('reset-password');
        }
        if (event === 'SIGNED_OUT') {
           setSession(null);
           setIsResetPasswordView(false);
           setMustChangePassword(false);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const res = await storeService.login(loginEmail, loginPass);
      if (res.success && res.session) {
        setSession(res.session);
        if (res.mustChangePassword) setMustChangePassword(true);
        else handleRoleLanding(res.session.userRole);
      } else {
        setAuthError(res.error || 'Credenciais inválidas');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) return;
    if (newPassword.length < 8) return triggerFeedback('Mínimo 8 caracteres.', 'error');
    if (newPassword !== confirmPassword) return triggerFeedback('Senhas não coincidem.', 'error');

    setIsLoggingIn(true);
    try {
      const res = await storeService.updatePassword(newPassword);
      if (res.success) {
        setMustChangePassword(false);
        setIsResetPasswordView(false);
        storeService.logout();
        setSession(null);
        setViewMode('store');
        setCurrentRoute('public-home');
        triggerFeedback('Senha alterada com sucesso! Faça login novamente.');
      } else {
        triggerFeedback(res.error || 'Erro na atualização.', 'error');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRecover = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    
    const email = loginEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      triggerFeedback('Por favor, informe um e-mail válido.', 'error');
      return;
    }

    if (isLoggingIn) return;
    setIsLoggingIn(true);
    
    try {
      const res = await storeService.recoverPassword(email);
      if (res.success) {
        triggerFeedback('Link de recuperação enviado. Verifique seu email.', 'success');
        setIsRecoveryMode(false);
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      triggerFeedback(err.message || 'Erro ao enviar link de recuperação', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    storeService.logout();
    setSession(null);
    setViewMode('store');
    setMustChangePassword(false);
    setIsResetPasswordView(false);
    setCurrentRoute('public-home');
  };

  const handleNavigate = (route: Route) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentRoute(route);
    if (window.innerWidth <= 1024) setIsSidebarOpen(false);
  };

  if (!isSystemReady) return <div className="h-screen bg-slate-900 flex items-center justify-center animate-pulse text-white font-black text-4xl">G</div>;

  const renderFeedback = () => feedback && (
    <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[1000] animate-in slide-in-from-top-10 duration-300">
      <div className={`px-12 py-5 border border-emerald-500 text-white rounded-[50px] shadow-2xl font-black text-[10px] uppercase tracking-widest ${feedback.type === 'error' ? 'bg-red-900 border-red-500' : 'bg-slate-900'}`}>
        {feedback.message}
      </div>
    </div>
  );

  // View Especial de Redefinição de Senha
  if (currentRoute === 'reset-password' || isResetPasswordView) {
    return (
      <>
        {renderFeedback()}
        <ResetPasswordPage 
          onSuccess={() => {
            triggerFeedback('Sua senha foi redefinida! Faça login agora.', 'success');
            handleLogout();
          }} 
          onCancel={() => handleLogout()} 
          triggerFeedback={triggerFeedback}
        />
      </>
    );
  }

  // Admin View Login Protection
  if (viewMode === 'admin' && !session) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center p-6">
        {renderFeedback()}
        <div className="w-full max-w-md bg-white rounded-[60px] p-12 shadow-2xl text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-500 rounded-[30px] flex items-center justify-center text-white text-4xl font-black mx-auto shadow-2xl">G</div>
            <h1 className="text-3xl font-black text-slate-900 uppercase">G-Fit Login</h1>
            {authError && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase">{authError}</div>}
            
            {!mustChangePassword ? (
              <form onSubmit={handleLogin} className="space-y-4 pt-4 text-left">
                <input disabled={isLoggingIn} type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="E-mail de acesso" className="w-full bg-slate-50 border-none rounded-3xl p-6 outline-none font-bold shadow-inner" required />
                <input disabled={isLoggingIn} type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="Senha" className="w-full bg-slate-50 border-none rounded-3xl p-6 outline-none font-bold shadow-inner" required />
                <div className="flex justify-between items-center px-4">
                   <button type="button" onClick={() => setIsRecoveryMode(true)} className="text-[9px] font-black text-slate-400 uppercase hover:text-emerald-500 transition-colors">Esqueci minha senha?</button>
                </div>
                <button disabled={isLoggingIn} className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black text-xs uppercase hover:bg-emerald-500 transition-all">Autenticar</button>
              </form>
            ) : (
              <form onSubmit={handleUpdatePassword} className="space-y-4 pt-4 text-left">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest text-center">⚠️ Defina sua senha definitiva.</p>
                <input disabled={isLoggingIn} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nova senha" className="w-full bg-slate-50 border-none rounded-3xl p-6 outline-none font-bold shadow-inner" required />
                <input disabled={isLoggingIn} type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirmar senha" className="w-full bg-slate-50 border-none rounded-3xl p-6 outline-none font-bold shadow-inner" required />
                <button disabled={isLoggingIn} className="w-full py-6 bg-emerald-500 text-white rounded-[32px] font-black text-xs uppercase hover:bg-emerald-600 transition-all">Salvar e Acessar</button>
              </form>
            )}

            {!mustChangePassword && (
              <button type="button" onClick={() => storeService.loginWithGoogle()} className="w-full py-5 border-2 border-slate-100 rounded-[32px] font-black text-[10px] uppercase flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors">
                <img src="https://img.icons8.com/color/24/google-logo.png" alt="Google" className="w-5 h-5" />
                Google SSO
              </button>
            )}
            <button onClick={() => setViewMode('store')} className="text-[10px] font-black text-slate-400 uppercase underline mt-4 hover:text-slate-900">Vitrine Pública</button>
        </div>

        {/* Modal de Recuperação de Senha */}
        {isRecoveryMode && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-6 animate-in fade-in duration-300">
             <div className="bg-white rounded-[50px] p-12 max-w-sm w-full shadow-2xl space-y-6 text-center animate-in zoom-in-95">
                <div className="text-4xl">📧</div>
                <h3 className="text-2xl font-black text-slate-900 uppercase">Recuperar Acesso</h3>
                <p className="text-slate-500 text-xs font-medium leading-relaxed">Enviaremos um link de acesso direto para o seu e-mail cadastrado.</p>
                <form onSubmit={handleRecover} className="space-y-4">
                   <input required type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Seu e-mail de acesso" className="w-full bg-slate-50 border-none rounded-2xl p-6 outline-none font-bold shadow-inner" />
                   <button 
                     type="submit"
                     disabled={isLoggingIn} 
                     className="w-full py-5 bg-emerald-500 text-white rounded-[24px] font-black text-xs uppercase shadow-xl hover:bg-emerald-600 transition-all active:scale-95"
                   >
                     {isLoggingIn ? 'ENVIANDO...' : 'Enviar link de recuperação'}
                   </button>
                   <button type="button" onClick={() => setIsRecoveryMode(false)} className="w-full py-3 text-[10px] font-black text-slate-400 uppercase hover:text-slate-900">Voltar</button>
                </form>
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      {renderFeedback()}

      {viewMode === 'store' ? (
        <div className="min-h-screen bg-white flex flex-col relative w-full overflow-y-auto custom-scrollbar">
           <PublicHeader onNavigate={handleNavigate} cartCount={cart.length} onOpenCoach={() => setIsCoachOpen(true)} onSwitchMode={() => setViewMode('admin')} user={session} />
           <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
              {currentRoute === 'public-home' && <PublicHome onNavigate={handleNavigate} onAddToCart={p => setCart([...cart, p])} />}
              {currentRoute === 'departments' && <PublicDepartments onNavigate={handleNavigate} />}
              {currentRoute === 'store-catalog' && <PublicCatalog onBuy={p => setCart([...cart, p])} />}
              {currentRoute === 'store-offers' && <PublicCatalog onBuy={p => setCart([...cart, p])} showOnlyOffers />}
              {currentRoute === 'checkout' && <CheckoutPage product={cart.length > 0 ? cart[0] : null} onComplete={() => { setCart([]); handleNavigate('customer-portal'); }} />}
              {currentRoute === 'public-contact' && <PublicContact />}
              {currentRoute === 'affiliate-register' && <PublicAffiliateRegister onComplete={() => handleNavigate('public-home')} />}
              {currentRoute === 'favorites' && <PublicFavorites user={session} onAddToCart={p => setCart([...cart, p])} onNavigate={handleNavigate} />}
              {currentRoute === 'affiliate-portal' && <AffiliatePortal user={session} onNavigate={handleNavigate} />}
              {currentRoute === 'customer-portal' && <CustomerPortal user={session} onNavigate={handleNavigate} />}
           </main>
           <PublicFooter onNavigate={handleNavigate} />
           <AICoach isOpen={isCoachOpen} onClose={() => setIsCoachOpen(false)} />
           <LGPDBanner />
           <button onClick={() => setIsCoachOpen(true)} className="fixed bottom-8 right-8 w-16 h-16 bg-emerald-500 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl hover:scale-110 active:scale-95 transition-all z-[90] animate-bounce">🤖</button>
        </div>
      ) : (
        <>
          <Sidebar isOpen={isSidebarOpen} currentRoute={currentRoute} onNavigate={handleNavigate} userRole={session!.userRole} onLogout={handleLogout} onSwitchToStore={() => setViewMode('store')} />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <HeaderSimple onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} title={currentRoute.replace('-', ' ').toUpperCase()} user={session!} />
            <main className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar bg-slate-50">
              <div className="max-w-7xl mx-auto pb-24 md:pb-20">
                {currentRoute === 'dashboard' && <Dashboard />}
                {currentRoute === 'core-settings' && <CoreSettings />}
                {currentRoute === 'core-users' && <CoreUsers />}
                {currentRoute === 'core-roles' && <CoreRoles />}
                {currentRoute === 'orders' && <OrdersPage />}
                {currentRoute === 'products-catalog' && <ProductsCatalog />}
                {currentRoute === 'departments' && <Departments />}
                {currentRoute === 'categories' && <CategoriesPage />}
                {currentRoute === 'coupons' && <CouponsPage />}
                {currentRoute === 'mkt-banners' && <MarketingBanners />}
                {currentRoute === 'mkt-remkt' && <MarketingRemarketing />}
                {currentRoute === 'mkt-chat' && <MarketingChatIA />}
                {currentRoute === 'seo-onpage' && <SEOOnPage />}
                {currentRoute === 'seo-tech' && <SEOTechnical />}
                {currentRoute === 'seo-perf' && <SEOPerformance />}
                {currentRoute === 'seo-audit' && <SEOMonitoring />}
                {currentRoute === 'fin-gateways' && <FinancePayments />}
                {currentRoute === 'fin-trans' && <FinanceTransactions />}
                {currentRoute === 'fin-reports' && <FinanceReports />}
                {currentRoute === 'mkp-sellers' && <MarketplaceSellers />}
                {currentRoute === 'mkp-prods' && <MarketplaceProducts />}
                {currentRoute === 'mkp-orders' && <MarketplaceOrders />}
                {currentRoute === 'mkp-fin' && <MarketplaceFinance />}
                {currentRoute === 'aff-overview' && <AffiliatesOverview />}
                {currentRoute === 'aff-commissions' && <AffiliatesCommissions />}
                {currentRoute === 'aff-links' && <AffiliatesLinks />}
                {currentRoute === 'aff-reports' && <AffiliatesReports />}
                {currentRoute === 'lgpd-consents' && <LGPDConsentPage />}
                {currentRoute === 'lgpd-mydata' && <LGPDUserDataPage currentUser={session!} />}
                {currentRoute === 'lgpd-logs' && <LGPDLogsPage />}
                {currentRoute === 'lgpd-policy' && <LGPDPoliciesPage />}
                {currentRoute === 'pwa-settings' && <PWASettings />}
                {currentRoute === 'pwa-installs' && <PWAInstallation />}
                {currentRoute === 'pwa-push' && <PWANotifications />}
                {currentRoute === 'int-apis' && <IntegrationAPIs />}
                {currentRoute === 'int-crm' && <IntegrationCRM />}
                {currentRoute === 'int-wa' && <IntegrationWhatsApp />}
                {currentRoute === 'int-erp' && <IntegrationERP />}
                {currentRoute === 'ai-recom' && <AIRecommendations />}
                {currentRoute === 'ai-predict' && <AIPredictions />}
                {currentRoute === 'ai-automations' && <AIAutomations />}
                {currentRoute === 'ai-logs' && <AILogs />}
                {currentRoute === 'sec-auth' && <SecurityAuth currentUser={session!} />}
                {currentRoute === 'sec-perms' && <SecurityPermissions />}
                {currentRoute === 'sec-audit' && <SecurityAudit />}
                {currentRoute === 'sec-logs' && <SecurityLogs />}
                {currentRoute === 'infra-env' && <InfraEnvironment />}
                {currentRoute === 'infra-deploy' && <InfraDeploy currentUser={session!} />}
                {currentRoute === 'infra-backup' && <InfraBackup />}
                {currentRoute === 'infra-monitoring' && <InfraMonitoring />}
                {currentRoute === 'help-overview' && <HelpOverview />}
                {currentRoute === 'help-core-detail' && <HelpCoreDetail />}
              </div>
            </main>
          </div>
          <LGPDBanner />
        </>
      )}
    </div>
  );
};

export default App;
