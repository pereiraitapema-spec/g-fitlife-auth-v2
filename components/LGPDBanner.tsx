
import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';

const LGPDBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem('__lgpd_consent_accepted__');
    if (!hasAccepted) {
      setTimeout(() => setIsVisible(true), 2000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('__lgpd_consent_accepted__', 'true');
    storeService.saveConsent('visitante_anonimo@gfitlife.io', true);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-10 left-10 right-10 z-[200] animate-in slide-in-from-bottom-20 duration-1000">
      <div className="bg-slate-900 border border-white/10 rounded-[40px] p-8 md:p-10 shadow-2xl flex flex-col md:flex-row items-center gap-8 backdrop-blur-xl bg-opacity-95">
        <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-lg shadow-emerald-500/20">🛡️</div>
        <div className="flex-1 space-y-2 text-center md:text-left">
           <h4 className="text-xl font-black text-white tracking-tight">Privacidade & Transparência</h4>
           <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
             Usamos cookies e tecnologias similares para melhorar sua experiência. Ao continuar, você concorda com nossa 
             <button className="text-emerald-400 font-bold hover:underline mx-1">Política de Privacidade</button> e 
             <button className="text-emerald-400 font-bold hover:underline mx-1">Termos de Uso</button> em conformidade com a LGPD.
           </p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
           <button onClick={handleAccept} className="flex-1 md:flex-none px-10 py-5 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 active:scale-95">ACEITAR TUDO</button>
           <button onClick={() => setIsVisible(false)} className="px-10 py-5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-all">REJEITAR</button>
        </div>
      </div>
    </div>
  );
};

export default LGPDBanner;
