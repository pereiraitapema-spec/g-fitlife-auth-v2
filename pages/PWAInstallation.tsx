
import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';

const PWAInstallation: React.FC = () => {
  const [metrics, setMetrics] = useState(storeService.getPWAMetrics());

  useEffect(() => {
    setMetrics(storeService.getPWAMetrics());
  }, []);

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Status de Instalações</h2>
          <p className="text-slate-500 font-medium">Acompanhe a adoção do App G-FitLife nos dispositivos mobile.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         {[
           { label: 'Apps Instalados', val: metrics.installs, icon: '📲', color: 'emerald' },
           { label: 'Usuários Ativos (App)', val: metrics.activeUsersMobile, icon: '🔥', color: 'blue' },
           { label: 'Versão do Bundle', val: metrics.version, icon: '📦', color: 'slate' },
           { label: 'Retention Rate', val: '84%', icon: '🔄', color: 'purple' },
         ].map((stat, i) => (
            <div key={i} className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex flex-col items-center text-center">
               <div className={`w-16 h-16 bg-${stat.color}-500/10 text-${stat.color}-500 rounded-3xl flex items-center justify-center text-3xl mb-4`}>{stat.icon}</div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
               <p className="text-4xl font-black text-slate-900 tracking-tighter">{stat.val}</p>
            </div>
         ))}
      </div>

      <div className="bg-slate-900 rounded-[60px] p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-12">
         <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
         <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center shrink-0">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://gfitlife.io" className="w-24 h-24" alt="QR Install" />
         </div>
         <div className="flex-1 space-y-4">
            <h3 className="text-2xl font-black">Instalação via QR Code</h3>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              Disponibilize este código em sua vitrine física ou campanhas de marketing para que os clientes instalem o App instantaneamente sem precisar de lojas (App Store/Play Store).
            </p>
            <div className="flex gap-4 pt-4">
               <button className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">IMPRIMIR ADESIVO</button>
               <button className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">LINK DIRETO</button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default PWAInstallation;
