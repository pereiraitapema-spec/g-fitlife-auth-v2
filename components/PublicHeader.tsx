import React, { useState, useEffect } from 'react';
import { Route } from '../App';
import { UserSession, UserRole, SystemSettings } from '../types';
import { storeService } from '../services/storeService';

interface PublicHeaderProps {
  onNavigate: (route: Route) => void;
  cartCount: number;
  onOpenCoach: () => void;
  onSwitchMode: () => void;
  user: UserSession | null;
}

const PublicHeader: React.FC<PublicHeaderProps> = ({ onNavigate, cartCount, onOpenCoach, onSwitchMode, user }) => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const loadSettings = async () => {
    const s = await storeService.getSettings();
    setSettings(s);
  };

  useEffect(() => {
    loadSettings();
    window.addEventListener('systemSettingsChanged', loadSettings);
    return () => window.removeEventListener('systemSettingsChanged', loadSettings);
  }, []);

  const isStaff = user && (
    user.userRole === UserRole.ADMIN_MASTER || 
    user.userRole === UserRole.ADMIN_OPERATIONAL || 
    user.userRole === UserRole.FINANCE || 
    user.userRole === UserRole.MARKETING
  );

  const isAffiliate = user?.userRole === UserRole.AFFILIATE;

  return (
    <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => onNavigate('public-home')} className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl overflow-hidden flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-500/20 group-hover:rotate-6 transition-transform">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} className="w-full h-full object-cover" alt="Logo" />
            ) : (
              'G'
            )}
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tighter">
            {settings?.nomeLoja || 'G-FitLife'}
          </span>
        </button>

        {/* Nav Central */}
        <nav className="hidden lg:flex items-center gap-10">
          <button onClick={() => onNavigate('public-home')} className="text-xs font-bold text-slate-600 hover:text-emerald-500 transition-colors uppercase tracking-widest">Home</button>
          <button onClick={() => onNavigate('departments')} className="text-xs font-bold text-slate-600 hover:text-emerald-500 transition-colors uppercase tracking-widest">Departamentos</button>
          <button onClick={() => onNavigate('store-catalog')} className="text-xs font-bold text-slate-600 hover:text-emerald-500 transition-colors uppercase tracking-widest">Produtos</button>
          
          {/* Menu Afiliados Dinâmico */}
          <button 
            onClick={() => isAffiliate ? onNavigate('affiliate-portal') : onNavigate('affiliate-register')} 
            className={`text-xs font-black uppercase tracking-widest transition-all px-4 py-2 rounded-xl flex items-center gap-2 ${
              isAffiliate ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100' : 'text-slate-600 hover:text-emerald-500'
            }`}
          >
            {isAffiliate ? (
              <>
                <span className="text-lg">🤝</span>
                Meu Portal Afiliado
              </>
            ) : (
              'Afiliados'
            )}
          </button>

          <button onClick={() => onNavigate('store-offers')} className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-widest flex items-center gap-1">
            <span className="animate-pulse text-lg">🔥</span> Ofertas
          </button>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
           {user ? (
              <div className="flex items-center gap-4">
                 <button 
                  onClick={() => onNavigate('favorites')}
                  className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-emerald-500 hover:border-emerald-200 transition-all shadow-sm"
                  title="Meus Favoritos"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                     <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                   </svg>
                 </button>
                 <div onClick={() => onNavigate('customer-portal')} className="hidden sm:block text-right cursor-pointer group">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-emerald-500">Meu Perfil</p>
                    <p className="text-xs font-black text-slate-800">{user.userName.split(' ')[0]}</p>
                 </div>
                 {isStaff && (
                   <button onClick={onSwitchMode} className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-emerald-500 transition-all shadow-xl" title="Console Admin">
                      ⚙️
                   </button>
                 )}
              </div>
           ) : (
             <button onClick={onSwitchMode} className="hidden md:flex px-6 py-2 border-2 border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">Acessar Conta</button>
           )}
           
           <button onClick={() => onNavigate('checkout')} className="relative p-3 bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-4 border-white shadow-lg">
                  {cartCount}
                </span>
              )}
           </button>

           <button 
              className="lg:hidden p-2 text-slate-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 p-6 space-y-4 animate-in slide-in-from-top-4">
          <button onClick={() => { onNavigate('public-home'); setIsMenuOpen(false); }} className="w-full text-left py-3 font-bold text-slate-700">Home</button>
          <button onClick={() => { onNavigate('store-catalog'); setIsMenuOpen(false); }} className="w-full text-left py-3 font-bold text-slate-700">Produtos</button>
          <button onClick={() => { isAffiliate ? onNavigate('affiliate-portal') : onNavigate('affiliate-register'); setIsMenuOpen(false); }} className="w-full text-left py-3 font-black text-emerald-600">Afiliados</button>
          <button onClick={() => { onOpenCoach(); setIsMenuOpen(false); }} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest">🤖 Falar com IA Coach</button>
        </div>
      )}
    </header>
  );
};

export default PublicHeader;