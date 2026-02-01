
import React from 'react';
import { Route } from '../App';

interface PublicHeaderProps {
  onNavigate: (route: Route) => void;
  cartCount: number;
  onOpenCoach: () => void;
  onSwitchMode: () => void;
}

const PublicHeader: React.FC<PublicHeaderProps> = ({ onNavigate, cartCount, onOpenCoach, onSwitchMode }) => {
  return (
    <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => onNavigate('public-home')} className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-500/20 group-hover:rotate-6 transition-transform">G</div>
          <span className="text-2xl font-black text-slate-900 tracking-tighter">G-FitLife</span>
        </button>

        {/* Nav */}
        <nav className="hidden lg:flex items-center gap-10">
          <button onClick={() => onNavigate('public-home')} className="text-xs font-bold text-slate-600 hover:text-emerald-500 transition-colors uppercase tracking-widest">Home</button>
          <button onClick={() => onNavigate('departments')} className="text-xs font-bold text-slate-600 hover:text-emerald-500 transition-colors uppercase tracking-widest">Departamentos</button>
          <button onClick={() => onNavigate('store-catalog')} className="text-xs font-bold text-slate-600 hover:text-emerald-500 transition-colors uppercase tracking-widest">Produtos</button>
          <button onClick={() => onNavigate('store-offers')} className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-widest flex items-center gap-1">
            <span className="animate-pulse text-lg">🔥</span> Ofertas
          </button>
          <button onClick={() => onNavigate('public-contact')} className="text-xs font-bold text-slate-600 hover:text-emerald-500 transition-colors uppercase tracking-widest">Contato</button>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
           <button onClick={() => onNavigate('orders')} className="hidden md:flex px-6 py-2 border-2 border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">Minha Conta</button>
           
           <button onClick={() => onNavigate('checkout')} className="relative p-3 bg-slate-900 text-white rounded-2xl hover:bg-emerald-500 transition-all shadow-xl active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-4 border-white">
                  {cartCount}
                </span>
              )}
           </button>

           <button onClick={onSwitchMode} className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:text-slate-900" title="Gerenciar Sistema (Admin)">
              ⚙️
           </button>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
