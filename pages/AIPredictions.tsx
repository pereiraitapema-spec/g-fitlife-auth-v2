
import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { AIPrediction } from '../types';

const AIPredictions: React.FC = () => {
  const [predictions, setPredictions] = useState<AIPrediction[]>([]);

  useEffect(() => {
    setPredictions(storeService.getAIPredictions());
  }, []);

  return (
    <div className="animate-in fade-in duration-700 space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Previsão de Faturamento</h2>
          <p className="text-slate-500 font-medium">Projeções baseadas em dados históricos, sazonalidade e tendências de mercado.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         <div className="lg:col-span-7">
            <div className="bg-slate-900 rounded-[60px] p-12 text-white shadow-2xl relative overflow-hidden h-full">
               <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[150px] -mr-32 -mt-32"></div>
               <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4">Estimativa Global</p>
               <h3 className="text-6xl font-black tracking-tighter mb-8 text-emerald-400">R$ {predictions[0]?.projectedSales.toLocaleString()}</h3>
               <div className="flex items-center gap-4 mb-12">
                  <div className="px-6 py-2 bg-white/10 rounded-full text-xs font-black uppercase tracking-widest border border-white/10">
                     Confiança: {predictions[0]?.confidence}%
                  </div>
                  <span className="text-slate-500 text-xs font-bold italic">Baseado em 1.200 transações analisadas</span>
               </div>
               
               <div className="space-y-6 border-t border-white/5 pt-10">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Variação Mensal Projetada</p>
                  <div className="flex items-end gap-3 h-32 px-4">
                     {[20, 35, 45, 60, 55, 75, 95].map((h, i) => (
                        <div key={i} className={`flex-1 rounded-t-xl transition-all duration-700 ${i === 6 ? 'bg-emerald-500' : 'bg-white/10'}`} style={{ height: `${h}%` }}></div>
                     ))}
                  </div>
                  <div className="flex justify-between text-[9px] font-black text-slate-600 uppercase">
                     <span>Jan</span><span>Fev</span><span>Mar</span><span>Abr</span><span>Mai</span><span>Jun</span><span className="text-emerald-500">Jul (Projetado)</span>
                  </div>
               </div>
            </div>
         </div>

         <div className="lg:col-span-5 space-y-8">
            <div className="bg-white rounded-[50px] border border-slate-100 p-10 shadow-sm space-y-6">
               <h4 className="text-xl font-black text-slate-900 border-b border-slate-50 pb-4">Insights Estratégicos</h4>
               <div className="space-y-4">
                  {predictions[0]?.insights.map((insight, i) => (
                    <div key={i} className="flex gap-4 p-5 bg-slate-50 rounded-3xl group hover:bg-emerald-50 transition-all">
                       <span className="text-2xl group-hover:scale-125 transition-transform">💡</span>
                       <p className="text-sm font-bold text-slate-700 leading-relaxed">{insight}</p>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-emerald-500 rounded-[50px] p-10 text-white shadow-xl relative overflow-hidden group">
               <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -mb-16 -mr-16 transition-all group-hover:scale-150"></div>
               <h4 className="text-lg font-black mb-2">Simulador de Expansão</h4>
               <p className="text-sm text-emerald-100 font-medium mb-8">Aumente o investimento em Google Ads em 15% para elevar o faturamento projetado em R$ 22.000.</p>
               <button className="px-8 py-3 bg-white text-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">SIMULAR CENÁRIO</button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AIPredictions;
