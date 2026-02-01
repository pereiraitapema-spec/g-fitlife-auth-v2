
import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { InfraMetric } from '../types';

const InfraMonitoring: React.FC = () => {
  const [metrics, setMetrics] = useState<InfraMetric>(storeService.getInfraMetrics());

  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics(storeService.getInfraMetrics());
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const getHealthColor = (val: number, limit: number) => {
    if (val < limit * 0.5) return 'emerald';
    if (val < limit * 0.8) return 'amber';
    return 'red';
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Telemetria de Saúde</h2>
          <p className="text-slate-500 font-medium">Monitoramento em tempo real da performance do cluster.</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
           <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Sistema Operacional</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         {[
           { label: 'Uptime Sistema', val: metrics.uptime, icon: '⏱️', color: 'blue' },
           { label: 'Latência Edge', val: metrics.latency + 'ms', icon: '📡', color: 'emerald' },
           { label: 'Carga CPU', val: metrics.cpu + '%', icon: '⚡', color: getHealthColor(metrics.cpu, 100) },
           { label: 'Consumo RAM', val: metrics.ram + '%', icon: '🧠', color: getHealthColor(metrics.ram, 100) },
         ].map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col items-center text-center">
               <div className={`w-14 h-14 bg-${stat.color}-500/10 text-${stat.color}-500 rounded-2xl flex items-center justify-center text-2xl mb-4`}>
                 {stat.icon}
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
               <p className={`text-4xl font-black text-${stat.color}-500 tracking-tighter`}>{stat.val}</p>
            </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         <div className="lg:col-span-8">
            <div className="bg-slate-900 rounded-[60px] p-10 text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-[100px] -mr-24 -mt-24"></div>
               <h3 className="text-xl font-black mb-8 border-b border-white/5 pb-4">Análise de Tráfego (Hits/Sec)</h3>
               <div className="flex items-end gap-3 h-64 px-4">
                  {[20, 35, 25, 50, 45, 60, 55, 75, 70, 85, 80, 95].map((h, i) => (
                    <div key={i} className="flex-1 bg-emerald-500/10 hover:bg-emerald-500 rounded-t-xl transition-all duration-500" style={{ height: `${h}%` }}></div>
                  ))}
               </div>
               <div className="flex justify-between mt-6 px-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  <span>Últimos 120 segundos</span>
                  <span>Escala Automática: Ativada</span>
               </div>
            </div>
         </div>

         <div className="lg:col-span-4">
            <div className="bg-white rounded-[60px] p-10 border border-slate-100 shadow-xl space-y-8">
               <h3 className="text-xl font-black text-slate-900">Histórico de Alertas</h3>
               <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-4">
                     <span className="text-lg">✅</span>
                     <div>
                        <p className="text-xs font-black text-slate-800">Database Optimized</p>
                        <p className="text-[9px] text-slate-400 uppercase">Há 4 horas</p>
                     </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-4">
                     <span className="text-lg">ℹ️</span>
                     <div>
                        <p className="text-xs font-black text-slate-800">New Region: Tokyo Active</p>
                        <p className="text-[9px] text-slate-400 uppercase">Há 12 horas</p>
                     </div>
                  </div>
               </div>
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center pt-4">Nenhum erro crítico nas últimas 48h</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default InfraMonitoring;
