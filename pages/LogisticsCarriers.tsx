
import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { Carrier } from '../types';

const LogisticsCarriers: React.FC = () => {
  const [carriers, setCarriers] = useState<Carrier[]>([]);

  useEffect(() => {
    setCarriers(storeService.getCarriers());
  }, []);

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Parceiros Logísticos</h2>
          <p className="text-slate-500 font-medium">Transportadoras integradas ao hub de distribuição.</p>
        </div>
        <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Cadastrar Transportadora</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {carriers.map(c => (
          <div key={c.id} className="bg-white rounded-[40px] border border-slate-100 p-10 flex items-center gap-8 shadow-sm group hover:shadow-2xl transition-all">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-4xl group-hover:rotate-12 transition-transform">🚚</div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-slate-900 mb-1">{c.name}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Tipo: {c.type === 'express' ? 'Prioritário' : 'Econômico'}</p>
              <div className="flex gap-4">
                 <span className="px-4 py-1.5 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">Ativo</span>
                 <button className="text-[10px] font-black text-slate-900 hover:text-emerald-500 uppercase tracking-widest">Configurar API</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogisticsCarriers;
