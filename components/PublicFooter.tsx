import React from 'react';
// Fixed: Route type is imported from ../types
import { Route } from '../types';

interface PublicFooterProps {
  onNavigate?: (route: Route) => void;
}

const PublicFooter: React.FC<PublicFooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-white py-20 mt-20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-black text-xl">G</div>
            <span className="text-2xl font-black tracking-tighter text-white">G-FitLife</span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            Sua plataforma definitiva para saúde, performance e suplementação avançada. Conectada com IA para sua melhor versão.
          </p>
          <div className="flex gap-4">
             <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-emerald-500 transition-all cursor-pointer">📸</div>
             <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-emerald-500 transition-all cursor-pointer">🐦</div>
             <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-emerald-500 transition-all cursor-pointer">🎬</div>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-lg font-black uppercase tracking-widest text-emerald-500">Links Úteis</h4>
          <ul className="space-y-4 text-slate-400 font-bold text-sm">
            <li 
              onClick={() => onNavigate && onNavigate('help-overview')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Sobre a G-Labs
            </li>
            <li 
              onClick={() => onNavigate && onNavigate('public-contact')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Trabalhe Conosco
            </li>
            <li 
              onClick={() => onNavigate && onNavigate('affiliate-register')}
              className="hover:text-emerald-400 transition-colors cursor-pointer font-black text-emerald-500/80"
            >
              Seja um Afiliado
            </li>
            <li 
              onClick={() => onNavigate && onNavigate('store-catalog')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Catálogo Completo
            </li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="text-lg font-black uppercase tracking-widest text-emerald-500">Ajuda & Suporte</h4>
          <ul className="space-y-4 text-slate-400 font-bold text-sm">
            <li 
              onClick={() => onNavigate && onNavigate('help-core-detail')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Central de Ajuda
            </li>
            <li 
              onClick={() => onNavigate && onNavigate('checkout')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Rastrear Pedido
            </li>
            <li 
              onClick={() => onNavigate && onNavigate('lgpd-policy')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Políticas de Troca
            </li>
            <li 
              onClick={() => onNavigate && onNavigate('lgpd-policy')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacidade LGPD
            </li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="text-lg font-black uppercase tracking-widest text-emerald-500">Newsletter</h4>
          <p className="text-slate-400 text-xs font-bold leading-relaxed uppercase tracking-widest">Receba ofertas e dicas de treino.</p>
          <div className="flex gap-2">
             <input placeholder="Seu e-mail" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs w-full outline-none focus:border-emerald-500" />
             <button className="bg-emerald-500 px-6 py-3 rounded-xl font-black text-[10px] uppercase">OK</button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 border-t border-white/5 mt-20 pt-10 flex flex-col md:row items-center justify-between gap-6">
         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">© 2024 G-FitLife Enterprise. Todos os direitos reservados.</p>
         <div className="flex gap-4">
            <img src="https://img.icons8.com/color/48/visa.png" className="h-6 grayscale opacity-30" alt="" />
            <img src="https://img.icons8.com/color/48/mastercard.png" className="h-6 grayscale opacity-30" alt="" />
            <img src="https://img.icons8.com/color/48/pix.png" className="h-6 grayscale opacity-30" alt="" />
         </div>
      </div>
    </footer>
  );
};

export default PublicFooter;