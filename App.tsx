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
import { UserSession, Product, UserRole, UserStatus } from './types';
import { supabase } from './backend/supabaseClient';

export type Route = 
  | 'dashboard' | 'core-settings' | 'core-users' | 'core-roles' 
  | 'help-overview' | 'help-core-detail' | 'affiliate-register'
  | 'products-catalog' | 'orders' | 'store-catalog' | 'checkout' | 'store-offers' | 'public-contact'
  | 'public-home' | 'departments' | 'categories' | 'coupons' | 'favorites'
  | 'affiliate-portal' | 'customer-portal'
  | 'mkt-banners' | 'mkt-remkt' | 'mkt-chat'
  | 'seo-onpage' | 'seo-tech' | 'seo-perf' | 'seo-audit'
  | 'fin-gateways' | 'fin-trans' | 'fin-reports'
  | 'log-carriers' | 'log-rates' | 'log-deliveries'
  | 'mkp-sellers' | 'mkp-prods' | 'mkp-orders' | 'mkp-fin'
  | 'aff-overview' | 'aff-commissions' | 'aff-links' | 'aff-reports'
  | 'lgpd-consents' | 'lgpd-mydata' | 'lgpd-logs' | 'lgpd-policy'
  | 'pwa-settings' | 'pwa-installs' | 'pwa-push'
  | 'int-apis' | 'int-crm' | 'int-wa' | 'int-erp'
  | 'ai-recom' | 'ai-predict' | 'ai-automations' | 'ai-logs'
  | 'sec-auth' | 'sec-perms' | 'sec-audit' | 'sec-logs'
  | 'infra-env' | 'infra-deploy' | 'infra-backup' | 'infra-monitoring';

const App: React.FC = () => {
  const [isSystemReady, setIsSystemReady] = useState(false);
  const [session, setSession] = useState<UserSession | null>(null);
  const [currentRoute, setCurrentRoute] = useState<Route>('public-home');
  const [viewMode, setViewMode] = useState<'store' | 'admin'>('store');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [cart, setCart] = useState<Product[]>([]);
  const [feedback, setFeedback] = useState<{message: string, type: 'success' | 'error' | 'warning'} | null>(null);
  
  // Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleRoleLanding = (role: UserRole) => {
    const staffRoles = [
      UserRole.ADMIN_MASTER, 
      UserRole.ADMIN_OPERATIONAL, 
      UserRole.FINANCE, 
      UserRole.MARKETING,
      UserRole.SELLER
    ];

    if (staffRoles.includes(role)) {
      setViewMode('admin');
      setCurrentRoute('dashboard');
    } else if (role === UserRole.AFFILIATE) {
      setViewMode('store');
      setCurrentRoute('affiliate-portal');
    } else if (role === UserRole.CUSTOMER) {
      setViewMode('store');
      setCurrentRoute('customer-portal');
    } else {
      setViewMode('store');
      setCurrentRoute('public-home');
    }
  };

  const syncAuth = async () => {
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      const profile = await storeService.getProfileAfterLogin(data.session.user.id);
      if (profile && profile.status === UserStatus.ACTIVE) {
        const newSession = storeService.createSession(profile);
        setSession(newSession);
        handleRoleLanding(profile.role);
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      await storeService.initializeSystem();
      await syncAuth();
      setIsSystemReady(true);
    };
    init();

    const handleSessionChange = () => setSession(storeService.getActiveSession());
    window.addEventListener('sessionUpdated', handleSessionChange);
    return () => window.removeEventListener('sessionUpdated', handleSessionChange);
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
        handleRoleLanding(res.session.userRole);
        setFeedback({ message: 'Acesso Autorizado!', type: 'success' });
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setAuthError(res.error || 'Credenciais inválidas');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    storeService.logout();
    setSession(null);
    setViewMode('store');
    setCurrentRoute('public-home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (route: Route) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentRoute(route);
    if (window.innerWidth <= 1024) setIsSidebarOpen(false);
  };

  if (!isSystemReady) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Proteção de Login para Painel Admin
  if (viewMode === 'admin' && !session) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-[60px] p-12 shadow-2xl animate-in zoom-in-95 duration-700">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-500 rounded-[30px] flex items-center justify-center text-white text-4xl font-black mx-auto shadow-2xl shadow-emerald-500/20">G</div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">G-Fit Hub Login</h1>
            {authError && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase border border-red-100">{authError}</div>}
            <form onSubmit={handleLogin} className="space-y-4 pt-4 text-left">
               <div className="space-y-1">
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">E-mail Corporativo</label>
                 <input disabled={isLoggingIn} type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="admin@gfitlife.io" className="w-full bg-slate-50 border-none rounded-3xl p-6 outline-none font-bold shadow-inner focus:ring-4 focus:ring-emerald-500/10" required />
               </div>
               <div className="space-y-1">
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Senha Segura</label>
                 <input disabled={isLoggingIn} type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="••••••••" className="w-full bg-slate-50 border-none rounded-3xl p-6 outline-none font-bold shadow-inner focus:ring-4 focus:ring-emerald-500/10" required />
               </div>
               <button disabled={isLoggingIn} className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black text-xs uppercase hover:bg-emerald-500 transition-all shadow-xl active:scale-95">Autenticar agora</button>
            </form>
            <button onClick={() => setViewMode('store')} className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase underline">Voltar para a vitrine pública</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      {feedback && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-top-10">
          <div className={`px-12 py-5 border border-emerald-500 text-white rounded-[50px] shadow-2xl font-black text-[10px] uppercase tracking-widest ${feedback.type === 'error' ? 'bg-red-900' : 'bg-slate-900'}`}>
            {feedback.message}
          </div>
        </div>
      )}

      {viewMode === 'store' ? (
        <div className="min-h-screen bg-white flex flex-col relative w-full overflow-y-auto custom-scrollbar">
           <PublicHeader onNavigate={handleNavigate} cartCount={cart.length} onOpenCoach={() => setIsCoachOpen(true)} onSwitchMode={() => setViewMode('admin')} user={session} />
           <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 relative">
              {currentRoute === 'public-home' && <PublicHome onNavigate={handleNavigate} onAddToCart={p => setCart([...cart, p])} />}
              {currentRoute === 'departments' && <PublicDepartments onNavigate={handleNavigate} />}
              {currentRoute === 'store-catalog' && <PublicCatalog onBuy={() => handleNavigate('checkout')} />}
              {currentRoute === 'store-offers' && <PublicCatalog onBuy={() => handleNavigate('checkout')} showOnlyOffers />}
              {currentRoute === 'checkout' && <CheckoutPage product={null} onComplete={() => handleNavigate('customer-portal')} />}
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
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
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