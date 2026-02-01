
import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { SystemLog } from '../types';

const SEOMonitoring: React.FC = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);

  useEffect(() => {
    // Adicionado await para carregar logs do sistema e aplicar reverse()
    const load = async () => {
      setLogs((await storeService.getSystemLogs()).reverse());
    };
    load();
  }, []);

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Monitoramento & Auditoria</h2>
          <p className="text-slate-500 font-medium">Logs em tempo real de navegação, erros e eventos de segurança.</p>
        </div>
        <div className="flex gap-4">
           <button onClick={async () => { setLogs((await storeService.getSystemLogs()).reverse()); }} className="px-6 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:border-emerald-500 transition-all">ATUALIZAR LOGS</button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-[50px] shadow-2xl overflow-hidden border border-white/5">
        <div className="px-8 py-6 bg-white/5 border-b border-white/5 flex justify-between items-center">
           <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Console do Studio Backend</p>
           <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500"></span>
           </div>
        </div>
        <div className="p-8 space-y-3 max-h-[700px] overflow-y-auto custom-scrollbar font-mono">
           {logs.map(log => (
             <div key={log.id} className="group flex gap-6 p-4 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10">
                <span className="text-slate-500 text-[10px] shrink-0 pt-1">{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded shrink-0 h-fit ${
                  log.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {log.type}
                </span>
                <div className="flex-1">
                  <p className="text-slate-200 text-sm font-medium">{log.message}</p>
                  {log.path && <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Path: {log.path}</p>}
                </div>
                <button className="opacity-0 group-hover:opacity-100 text-[10px] font-black text-emerald-500 uppercase tracking-widest transition-all">Inspecionar</button>
             </div>
           ))}
           {logs.length === 0 && <p className="text-center py-20 text-slate-700 font-black uppercase tracking-widest">Aguardando telemetria do sistema...</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:scale-150 transition-all"></div>
            <h4 className="text-lg font-black text-slate-900 mb-6">Taxa de Erros (24h)</h4>
            <div className="flex items-end gap-2 h-32">
               {[2, 5, 3, 8, 1, 4, 2].map((h, i) => (
                 <div key={i} className="flex-1 bg-slate-100 rounded-t-lg transition-all hover:bg-emerald-500" style={{ height: `${h * 10}%` }}></div>
               ))}
            </div>
            <p className="text-[10px] font-black text-slate-400 mt-6 uppercase tracking-widest">Monitoramento estável.</p>
         </div>
         <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:scale-150 transition-all"></div>
            <h4 className="text-lg font-black text-slate-900 mb-6">Mapa de Calor (Hits)</h4>
            <div className="space-y-4">
               {[
                 { label: '/home', val: 85 },
                 { label: '/store', val: 62 },
                 { label: '/products/whey', val: 45 },
               ].map((page, i) => (
                 <div key={i} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>{page.label}</span>
                      <span>{page.val}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${page.val}%` }}></div>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default SEOMonitoring;
