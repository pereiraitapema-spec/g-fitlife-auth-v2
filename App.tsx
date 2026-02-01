
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
// Import missing pages
import PublicDepartments from './pages/PublicDepartments';
import Departments from './pages/Departments';
import CategoriesPage from './pages/CategoriesPage';
import CouponsPage from './pages/CouponsPage';
import PublicContact from './pages/PublicContact';
import AICoach from './components/AICoach';
import LGPDBanner from './components/LGPDBanner';
import { storeService } from './services/storeService';
import { UserSession, Product } from './types';

export type Route = 
  | 'dashboard' | 'core-settings' | 'core-users' | 'core-roles' 
  | 'help-overview' | 'help-core-detail'
  | 'products-catalog' | 'orders' | 'store-catalog' | 'checkout' | 'store-offers' | 'public-contact'
  | 'ai-recom' | 'ai-predict' | 'ai-automations' | 'ai-logs'
  | 'public-home' | 'departments' | 'categories' | 'coupons';

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

  const [showForcePass, setShowForcePass] = useState(false);
  const [newPass, setNewPass] = useState('');

  // BOOTSTRAP DE SISTEMA COM FONTE ÚNICA DE VERDADE
  useEffect(() => {
    const bootstrap = async () => {
      try {
        await storeService.initializeSystem();
        const active = storeService.getActiveSession();
        if (active) {
          setSession(active);
          setViewMode('admin');
          setCurrentRoute('dashboard');
        } else {
          setViewMode('store');
          setCurrentRoute('public-home');
        }
        setIsSystemReady(true);
      } catch (err) {
        console.error("Critical Bootstrap Failure", err);
        setInitError("Falha ao inicializar o banco de dados local. Limpe o cache e tente novamente.");
      }
    };
    bootstrap();

    const handleResize = () => setIsSidebarOpen(window.innerWidth > 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
        if (result.forcePasswordChange) {
          setSession(result.session);
          setShowForcePass(true);
          showFeedback("Primeiro acesso. Troque sua senha.", "warning");
        } else {
          setSession(result.session);
          setViewMode('admin');
          setCurrentRoute('dashboard');
          showFeedback("Bem-vindo ao sistema");
        }
      } else {
        setAuthError(result.error || 'Falha na autenticação');
        showFeedback(result.error || "Acesso Negado", "error");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass || newPass.length < 6) {
      showFeedback("A senha deve ter ao menos 6 caracteres.", "error");
      return;
    }
    // Fix: Ensure updateAdminCredentials exists in storeService
    const success = await storeService.updateAdminCredentials(session!.userId, session!.userEmail, newPass);
    if (success) {
      setShowForcePass(false);
      setViewMode('admin');
      setCurrentRoute('dashboard');
      showFeedback("Senha atualizada com sucesso");
    }
  };

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      let googleEmail = loginEmail.trim() || prompt("Simulador Google SSO: Digite o e-mail");
      if (!googleEmail) {
        setIsLoggingIn(false);
        return;
      }
      
      const result = await storeService.loginWithGoogle(googleEmail);
      if (result.success && result.session) {
        setSession(result.session);
        setViewMode('admin');
        setCurrentRoute('dashboard');
        showFeedback("Acesso liberado via Google");
      } else {
        setAuthError(result.error);
        showFeedback(result.error || "Email não encontrado", "error");
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
    showFeedback("Sessão encerrada");
  };

  const handleNavigate = (route: Route) => {
    if (window.innerWidth <= 1024) setIsSidebarOpen(false);
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isSystemReady) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center p-8 text-center font-sans">
        {initError ? (
          <div className="space-y-6 animate-in zoom-in-95">
            <div className="text-6xl">⚠️</div>
            <h1 className="text-2xl font-black text-white uppercase">Erro de Carga</h1>
            <p className="text-slate-400 max-w-xs mx-auto">{initError}</p>
            <button onClick={() => window.location.reload()} className="px-10 py-5 bg-emerald-500 text-white rounded-3xl font-black uppercase tracking-widest text-xs">Tentar Novamente</button>
          </div>
        ) : (
          <div className="space-y-8 animate-pulse">
             <div className="w-20 h-20 bg-emerald-500 rounded-[32px] flex items-center justify-center text-white text-4xl font-black mx-auto shadow-2xl shadow-emerald-500/20">G</div>
             <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">Validando Persistência...</p>
          </div>
        )}
      </div>
    );
  }

  if (showForcePass) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center p-4 relative font-sans">
        <div className="w-full max-w-md bg-white rounded-[60px] p-12 shadow-2xl relative z-10">
           <h1 className="text-3xl font-black text-center text-slate-900 mb-2">Nova Senha</h1>
           <p className="text-slate-400 text-center font-medium mb-12 text-sm">Por segurança, altere sua senha de primeiro acesso.</p>
           <form onSubmit={handleUpdatePassword} className="space-y-4">
             <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} className="w-full bg-slate-50 rounded-3xl p-6 outline-none font-bold shadow-inner" placeholder="Nova Senha" required />
             <button className="w-full py-6 bg-emerald-500 text-white rounded-[30px] font-black text-lg shadow-xl">SALVAR E ENTRAR</button>
           </form>
        </div>
      </div>
    );
  }

  if (viewMode === 'admin' && !session) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center p-4 relative font-sans">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070')] bg-cover opacity-20 grayscale"></div>
        <div className="w-full max-w-md bg-white rounded-[60px] p-12 shadow-2xl relative z-10 animate-in zoom-in-95">
           <button onClick={() => setViewMode('store')} className="absolute top-8 right-8 text-slate-300 font-bold">✕</button>
           <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center text-white text-4xl font-black mx-auto mb-10 shadow-2xl shadow-emerald-500/20">G</div>
           <h1 className="text-3xl font-black text-center text-slate-900 mb-2 tracking-tight">Admin Console</h1>
           <p className="text-slate-400 text-center font-medium mb-12 text-xs uppercase tracking-[0.3em]">Ambiente Seguro</p>
           {authError && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold text-center border border-red-100">{authError}</div>}
           <form onSubmit={handleLogin} className="space-y-4">
             <input disabled={isLoggingIn} type="text" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full bg-slate-50 rounded-3xl p-6 outline-none font-bold shadow-inner border-2 border-transparent focus:border-emerald-500" placeholder="E-mail" required />
             <input disabled={isLoggingIn} type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} className="w-full bg-slate-50 rounded-3xl p-6 outline-none font-bold shadow-inner border-2 border-transparent focus:border-emerald-500" placeholder="Senha" required />
             <button disabled={isLoggingIn} className="w-full py-6 bg-slate-900 text-white rounded-[30px] font-black text-lg hover:bg-emerald-500 transition-all active:scale-95 shadow-xl">{isLoggingIn ? 'ENTRANDO...' : 'ENTRAR NO PAINEL'}</button>
           </form>
           <div className="relative flex items-center justify-center my-10"><div className="w-full border-t border-slate-100"></div><span className="bg-white px-4 text-[10px] font-black text-slate-300 uppercase absolute">ou</span></div>
           <button onClick={handleGoogleLogin} disabled={isLoggingIn} className="w-full py-6 border-2 border-slate-100 hover:border-emerald-500 rounded-[30px] flex items-center justify-center gap-4 transition-all hover:bg-slate-50 active:scale-95">
             <img src="https://img.icons8.com/color/48/google-logo.png" className="w-6 h-6" alt="Google" /><span className="font-black text-slate-800 text-sm uppercase">Entrar com Google</span>
           </button>
           <div className="mt-10 p-6 bg-emerald-50 rounded-3xl text-center"><p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Acesso Padrão</p><p className="text-[11px] font-bold text-emerald-800">admin@system.local / admin123</p></div>
        </div>
      </div>
    );
  }

  const renderAdminContent = () => {
    switch (currentRoute) {
      case 'dashboard': return <Dashboard />;
      case 'core-settings': return <CoreSettings />;
      case 'core-users': return <CoreUsers />;
      case 'core-roles': return <CoreRoles />;
      case 'help-overview': return <HelpOverview />;
      case 'help-core-detail': return <HelpCoreDetail />;
      case 'products-catalog': return <ProductsCatalog />;
      case 'orders': return <OrdersPage />;
      // Fix: Components now imported and accessible
      case 'categories': return <CategoriesPage />;
      case 'departments': return <Departments />;
      case 'coupons': return <CouponsPage />;
      default: return <Dashboard />;
    }
  };

  const renderPublicContent = () => {
    switch (currentRoute) {
      case 'public-home': return <PublicHome onNavigate={handleNavigate} onAddToCart={p => { setCart([...cart, p]); showFeedback(`${p.name} adicionado!`); }} />;
      case 'departments': return <PublicDepartments onNavigate={handleNavigate} />;
      case 'store-catalog': return <PublicCatalog onBuy={p => { setSelectedProduct(p); setCurrentRoute('checkout'); }} />;
      case 'public-contact': return <PublicContact />;
      case 'checkout': return <CheckoutPage product={selectedProduct} onComplete={() => handleNavigate('public-home')} />;
      default: return <PublicHome onNavigate={handleNavigate} onAddToCart={p => { setCart([...cart, p]); showFeedback(`${p.name} adicionado!`); }} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans relative">
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
        <div className="min-h-screen bg-white font-sans flex flex-col relative w-full overflow-y-auto overflow-x-hidden custom-scrollbar">
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
