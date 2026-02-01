
import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { PaymentGateway } from '../types';

const FinancePayments: React.FC = () => {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);

  useEffect(() => {
    // Adicionado await para carregar gateways de pagamento
    const load = async () => {
      setGateways(await storeService.getGateways());
    };
    load();
  }, []);

  const toggleGateway = (id: string) => {
    const updated = gateways.map(g => g.id === id ? { ...g, status: g.status === 'active' ? 'inactive' : 'active' } : g);
    updated.forEach(g => storeService.saveGateway(g as any));
    setGateways(updated as any);
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Gateways de Pagamento</h2>
          <p className="text-slate-500 font-medium">Configure as pontes financeiras da G-FitLife.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {gateways.map(gw => (
          <div key={gw.id} className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm group hover:shadow-xl transition-all">
            <div className="flex justify-between items-start mb-8">
               <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                 {gw.type === 'pix' ? '💠' : gw.type === 'credit_card' ? '💳' : '📄'}
               </div>
               <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                 gw.status === 'active' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-100 text-slate-400'
               }`}>
                 {gw.status === 'active' ? 'Online' : 'Offline'}
               </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{gw.name}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Tipo: {gw.type.replace('_', ' ')}</p>
            
            <div className="flex gap-3">
              <button onClick={() => toggleGateway(gw.id)} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all">
                {gw.status === 'active' ? 'DESATIVAR' : 'ATIVAR'}
              </button>
              <button className="px-6 py-4 bg-slate-100 text-slate-400 rounded-2xl">⚙️</button>
            </div>
          </div>
        ))}
        
        <div className="bg-slate-50 rounded-[40px] border-4 border-dashed border-white flex flex-col items-center justify-center p-12 text-center opacity-60">
           <div className="text-4xl mb-4">➕</div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adicionar Integração API</p>
        </div>
      </div>
    </div>
  );
};

export default FinancePayments;
