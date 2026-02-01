
import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { AILogEntry } from '../types';

const AILogs: React.FC = () => {
  const [logs, setLogs] = useState<AILogEntry[]>([]);

  useEffect(() => {
    // Adicionado await para carregar logs de auditoria de IA
    const load = async () => {
      setLogs(await storeService.getAILogs());
    };
    load();
  }, []);

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Audit Trail IA</h2>
          <p className="text-slate-500 font-medium">Acompanhe a transparência algorítmica de todas as decisões automáticas.</p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-[50px] shadow-2xl overflow-hidden border border-white/5">
        <div className="px-8 py-6 bg-white/5 border-b border-white/5 flex justify-between items-center">
           <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">AI Logic Controller Console</p>
           <div className="flex items-center gap-3">
              <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Model: Gemini 2.5 Pro</span>
           </div>
        </div>
        <div className="p-8 space-y-3 max-h-[700px] overflow-y-auto custom-scrollbar font-mono">
           {logs.map(log => (
             <div key={log.id} className="group flex gap-6 p-4 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10">
                <span className="text-slate-500 text-[10px] shrink-0 pt-1">{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded shrink-0 h-fit ${
                  log.module === 'automation' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {log.module}
                </span>
                <div className="flex-1">
                  <p className="text-slate-200 text-sm font-medium">{log.decision}</p>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Outcome: {log.outcome}</p>
                </div>
                <button className="opacity-0 group-hover:opacity-100 text-[10px] font-black text-emerald-500 uppercase tracking-widest transition-all">Trace Logic</button>
             </div>
           ))}
           {logs.length === 0 && <p className="text-center py-20 text-slate-700 font-black uppercase tracking-widest">Aguardando telemetria neural...</p>}
        </div>
      </div>
    </div>
  );
};

export default AILogs;
