
import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { SecurityEvent } from '../types';

const SecurityLogs: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);

  useEffect(() => {
    // Adicionado await para carregar eventos de segurança e aplicar reverse()
    const load = async () => {
      setEvents((await storeService.getSecurityEvents()).reverse());
    };
    load();
  }, []);

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Logs de Eventos Críticos</h2>
          <p className="text-slate-500 font-medium">Monitoramento de ataques, falhas de autenticação e expiração de sessões.</p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-[50px] shadow-2xl overflow-hidden border border-white/5">
        <div className="p-8 space-y-3 font-mono">
           {events.length === 0 && <p className="text-center py-20 text-slate-700 font-black uppercase tracking-widest">Nenhum evento crítico registrado.</p>}
           {events.map(ev => (
             <div key={ev.id} className="flex gap-6 p-4 rounded-2xl border border-white/5 hover:bg-white/5 transition-all">
                <span className="text-slate-500 text-[10px] shrink-0">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded h-fit ${
                  ev.type === 'access_denied' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {ev.type}
                </span>
                <p className="text-slate-200 text-sm font-medium flex-1">{ev.message}</p>
                <button className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Investigar IP</button>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default SecurityLogs;
