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
import AICoach from './components/AICoach';
import LGPDBanner from './components/LGPDBanner';

// Imports de Novos Módulos
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
import { UserSession, Product, UserRole } from './types';
import { supabase } from './backend/supabaseClient';

export type Route = 
  | 'dashboard' | 'core-settings' | 'core-users' | 'core-roles' 
  | 'help-overview' | 'help-core-detail'
  | 'products-catalog' | 'orders' | 'store-catalog' | 'checkout' | 'store-offers' | 'public-contact'
  | 'public-home' | 'departments' | 'categories' | 'coupons'
  | 'mkt-banners' | 'mkt-remkt' | 'mkt-chat'
  | 'seo-onpage' | 'seo-tech' | 'seo-perf' | 'seo-audit'
  | 'fin-gateways' | 'fin-trans' | 'fin-reports'
  | 'log-carriers' | 'log-rates' | 'log-deliveries'
  | 'mkp-sellers' | 'mkp-prods' | 'mkp-orders' | 'mkp-fin'
  | 'lgpd-consents' | 'lgpd-mydata' | 'lgpd-logs' | 'lgpd-policy'
  | 'pwa-settings' | 'pwa-installs' | 'pwa-push'
  | 'int-apis' | 'int-crm' | 'int-wa' | 'int-erp'
  | 'ai-recom' | 'ai-predict' | 'ai-automations' | 'ai-logs'
  | 'sec-auth' | 'sec-perms' | 'sec-audit' | 'sec-logs'
  | 'infra-env' | 'infra-deploy' | 'infra-backup' | 'infra-monitoring';

const App: React.FC = () => {
  const [isSystemReady, setIsSystemReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [currentRoute, setCurrentRoute] = useState<Route>('public-home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'store' | 'admin'>('store');
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [cart, setCart] = useState<Product[]>([]);
  const [feedback, setFeedback] = useState<{message: string, type: 'success' | 'error' | 'warning'} | null>(null);
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        console.log('[BOOTSTRAP] Iniciando G-FitLife Hub...');
        await storeService.initializeSystem();
        
        // Tentativa de carregar sessão, com fallback se o supabase estiver nulo
        let sbSession = null;
        if (supabase) {
          try {
            const { data } = await supabase.auth.getSession();
            sbSession = data.session;
          } catch (e) {
            console.warn('[BOOTSTRAP] Supabase Auth indisponível:', e);
          }
        }
        
        if (sbSession) {
          const profile = await storeService.getProfileAfterLogin(sbSession.user.id);
          if (profile) {
            const newSess = storeService.createSession(profile);
            setSession(newSess);
            setViewMode('admin');
            setCurrentRoute('dashboard');
          }
        } else {
          const active = storeService.getActiveSession();
          if (active) {
            setSession(active);
            setViewMode('admin');
            setCurrentRoute('dashboard');
          } else {
            setViewMode('store');
            setCurrentRoute('public-home');
          }
        }
        setIsSystemReady(true);
      } catch (err) {
        console.error('[BOOTSTRAP] Erro fatal:', err);
        setInitError("Falha na inicialização do sistema. Verifique os logs.");
        // Garante que pelo menos a tela de erro apareça
        setIsSystemReady(true);
      }
    };
    bootstrap();

    const handleSessionUpdate = () => {
      setSession(storeService.getActiveSession());
    };
    window.addEventListener('sessionUpdated', handleSessionUpdate);
    const handleResize = () => setIsSidebarOpen(window.innerWidth > 1024);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('sessionUpdated', handleSessionUpdate);
    };
  }, []);

  const showFeedback = (msg: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setFeedback({ message: msg, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const result = await storeService.login(loginEmail, loginPass);
      if (result.success && result.session) {
        setSession(result.session);
        setViewMode('admin');
        setCurrentRoute('dashboard');
        showFeedback("Logado no Core System");
      } else {
        setAuthError(result.error || 'Acesso negado');
        showFeedback(result.error || "Erro de Auth", "error");
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
    showFeedback("Sessão encerrada.");
  };

  const handleNavigate = (route: Route) => {
    if (window.innerWidth <= 1024) setIsSidebarOpen(false);
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderAdminContent = () => {
    if (!session) return null;
    switch (currentRoute) {
      // Core & Catalog
      case 'dashboard': return <Dashboard />;
      case 'core-settings': return <CoreSettings />;
      case 'core-users': return <CoreUsers />;
      case 'core-roles': return <CoreRoles />;
      case 'products-catalog': return <ProductsCatalog />;
      case 'orders': return <OrdersPage />;
      case 'departments': return <Departments />;
      case 'categories': return <CategoriesPage />;
      case 'coupons': return <CouponsPage />;
      
      // Marketing
      case 'mkt-banners': return <MarketingBanners />;
      case 'mkt-remkt': return <MarketingRemarketing />;
      case 'mkt-chat': return <MarketingChatIA />;
      
      // SEO
      case 'seo-onpage': return <SEOOnPage />;
      case 'seo-tech': return <SEOTechnical />;
      case 'seo-perf': return <SEOPerformance />;
      case 'seo-audit': return <SEOMonitoring />;
      
      // Finance
      case 'fin-gateways': return <FinancePayments />;
      case 'fin-trans': return <FinanceTransactions />;
      case 'fin-reports': return <FinanceReports />;
      
      // Logistics
      case 'log-carriers': return <LogisticsCarriers />;
      case 'log-rates': return <LogisticsRates />;
      case 'log-deliveries': return <LogisticsDeliveries />;
      
      // Marketplace
      case 'mkp-sellers': return <MarketplaceSellers />;
      case 'mkp-prods': return <MarketplaceProducts />;
      case 'mkp-orders': return <MarketplaceOrders />;
      case 'mkp-fin': return <MarketplaceFinance />;
      
      // IA
      case 'ai-recom': return <AIRecommendations />;
      case 'ai-predict': return <AIPredictions />;
      case 'ai-automations': return <AIAutomations />;
      case 'ai-logs': return <AILogs />;
      
      // PWA
      case 'pwa-settings': return <PWASettings />;
      case 'pwa-installs': return <PWAInstallation />;
      case 'pwa-push': return <PWANotifications />;
      
      // Integrations
      case 'int-apis': return <IntegrationAPIs />;
      case 'int-crm': return <IntegrationCRM />;
      case 'int-wa': return <IntegrationWhatsApp />;
      case 'int-erp': return <IntegrationERP />;
      
      // Security & Infra
      case 'sec-auth': return <SecurityAuth currentUser={session} />;
      case 'sec-perms': return <SecurityPermissions />;
      case 'sec-audit': return <SecurityAudit />;
      case 'sec-logs': return <SecurityLogs />;
      case 'infra-env': return <InfraEnvironment />;
      case 'infra-deploy': return <InfraDeploy currentUser={session} />;
      case 'infra-backup': return <InfraBackup />;
      case 'infra-monitoring': return <InfraMonitoring />;
      
      // Help
      case 'help-overview': return <HelpOverview />;
      case 'help-core-detail': return <HelpCoreDetail />;
      
      default: return <Dashboard />;
    }
  };

  const renderPublicContent = () => {
    switch (currentRoute) {
      case 'public-home': return <PublicHome onNavigate={handleNavigate} onAddToCart={p => { setCart([...cart, p]); showFeedback(`${p.name} adicionado!`); }} />;
      case 'departments': return <PublicDepartments onNavigate={handleNavigate} />;
      case 'store-catalog': return <PublicCatalog onBuy={p => { setSelectedProduct(p); setCurrentRoute('checkout'); }} />;
      case 'store-offers': return <PublicCatalog onBuy={p => { setSelectedProduct(p); setCurrentRoute('checkout'); }} showOnlyOffers />;
      case 'checkout': return <CheckoutPage product={selectedProduct} onComplete={() => handleNavigate('public-home')} />;
      case 'public-contact': return <PublicContact />;
      default: return <PublicHome onNavigate={handleNavigate} onAddToCart={p => { setCart([...cart, p]); showFeedback(`${p.name} adicionado!`); }} />;
    }
  };

  if (!isSystemReady) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center p-8 text-center">
        <div className="space-y-8 animate-pulse">
           <div className="w-20 h-20 bg-emerald-500 rounded-[32px] flex items-center justify-center text-white text-4xl font-black mx-auto">G</div>
           <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Iniciando Hub Enterprise...</p>
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center p-8 text-center">
        <div className="space-y-6">
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Erro de Inicialização</h1>
          <p className="text-slate-400 max-w-sm mx-auto">{initError}</p>
          <button onClick={() => window.location.reload()} className="px-10 py-5 bg-emerald-500 text-white rounded-3xl font-black uppercase text-xs">Recarregar Sistema</button>
        </div>
      </div>
    );
  }

  if (viewMode === 'admin' && !session) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-slate-900 opacity-50"></div>
        <div className="w-full max-w-md bg-white rounded-[60px] p-12 shadow-2xl relative z-10 animate-in zoom-in-95">
           <button onClick={() => setViewMode('store')} className="absolute top-8 right-8 text-slate-300 font-bold hover:text-slate-900 transition-all">✕</button>
           <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-3xl font-black mx-auto mb-8 shadow-xl">G</div>
           <h1 className="text-3xl font-black text-center text-slate-900 mb-10 tracking-tight">Enterprise Login</h1>
           {authError && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold text-center">{authError}</div>}
           <form onSubmit={handleLogin} className="space-y-4">
             <input disabled={isLoggingIn} type="text" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full bg-slate-50 rounded-3xl p-6 outline-none font-bold border-2 border-transparent focus:border-emerald-500 transition-all shadow-inner" placeholder="E-mail Administrativo" required />
             <input disabled={isLoggingIn} type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} className="w-full bg-slate-50 rounded-3xl p-6 outline-none font-bold border-2 border-transparent focus:border-emerald-500 transition-all shadow-inner" placeholder="Senha" required />
             <button disabled={isLoggingIn} className="w-full py-6 bg-slate-900 text-white rounded-[30px] font-black text-lg hover:bg-emerald-500 transition-all active:scale-95 shadow-xl">{isLoggingIn ? 'SINC...' : 'ACESSAR CONSOLE'}</button>
           </form>
           <p className="mt-8 text-center text-slate-400 text-xs font-medium">Acesso restrito a operadores autorizados G-FitLife.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      {feedback && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-top-10">
          <div className={`px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-3 border ${
            feedback.type === 'error' ? 'bg-red-500 border-red-400 text-white' : 
            feedback.type === 'warning' ? 'bg-amber-500 border-amber-400 text-white' :
            'bg-slate-900 border-emerald-500 text-white'
          }`}>
             <span className="font-black text-xs uppercase tracking-widest">{feedback.message}</span>
          </div>
        </div>
      )}

      {viewMode === 'store' ? (
        <div className="min-h-screen bg-white flex flex-col relative w-full overflow-y-auto overflow-x-hidden custom-scrollbar">
           <PublicHeader onNavigate={handleNavigate} cartCount={cart.length} onOpenCoach={() => setIsCoachOpen(true)} onSwitchMode={() => setViewMode('admin')} />
           <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">{renderPublicContent()}</main>
           <PublicFooter />
           <AICoach isOpen={isCoachOpen} onClose={() => setIsCoachOpen(false)} />
           <LGPDBanner />
           <button onClick={() => setIsCoachOpen(true)} className="fixed bottom-8 right-8 w-16 h-16 bg-emerald-500 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl hover:scale-110 active:scale-95 transition-all z-[90] animate-bounce">🤖</button>
        </div>
      ) : (
        <>
          {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[45] lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>}
          <Sidebar isOpen={isSidebarOpen} currentRoute={currentRoute} onNavigate={handleNavigate} userRole={session!.userRole} onLogout={handleLogout} onSwitchToStore={() => setViewMode('store')} />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            <HeaderSimple onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} title={currentRoute.replace('-', ' ').toUpperCase()} user={session!} />
            <main className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar bg-slate-50">
              <div className="max-w-7xl mx-auto pb-24 md:pb-20">{renderAdminContent()}</div>
            </main>
          </div>
          <LGPDBanner />
        </>
      )}
    </div>
  );
};

export default App;