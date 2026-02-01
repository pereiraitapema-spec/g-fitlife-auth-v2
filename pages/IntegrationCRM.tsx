
import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { ExternalAPIConfig } from '../types';

const IntegrationCRM: React.FC = () => {
  const [configs, setConfigs] = useState<ExternalAPIConfig[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setConfigs(storeService.getAPIConfigs().filter(c => c.type === 'crm'));
  }, []);

  const handleSync = (provider: string) => {
    setIsSyncing(true);
    setTimeout(() => {
       storeService.syncCRM(provider);
       setConfigs([...storeService.getAPIConfigs().filter(c => c.type === 'crm')]);
       setIsSyncing(false);
       alert(`Sincronização com ${provider} concluída com sucesso!`);
    }, 2000);
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">CRM & Automação</h2>
          <p className="text-slate-500 font-medium">Sincronize seus leads e clientes com ferramentas externas de marketing.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {configs.map(cfg => (
          <div key={cfg.id} className="bg-white rounded-[50px] border border-slate-100 p-10 shadow-sm space-y-8 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  cfg.status === 'connected' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {cfg.status === 'connected' ? 'Ativo' : 'Offline'}
                </span>
             </div>
             <div className="flex items-center gap-6 border-b border-slate-50 pb-6">
                <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-3xl group-hover:rotate-12 transition-transform">🎯</div>
                <div>
                   <h3 className="text-xl font-black text-slate-900">{cfg.provider}</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Integração de Contatos</p>
                </div>
             </div>
             
             <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <span>Última Sincronização</span>
                   <span className="text-slate-900">{cfg.lastSync ? new Date(cfg.lastSync).toLocaleString() : 'Nunca'}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <span>Leads Pendentes</span>
                   <span className="text-emerald-500">0</span>
                </div>
             </div>

             <div className="flex gap-3 pt-4">
                <button 
                  disabled={isSyncing || cfg.status !== 'connected'}
                  onClick={() => handleSync(cfg.provider)}
                  className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all disabled:opacity-50"
                >
                  {isSyncing ? 'SINCRONIZANDO...' : 'SINCRONIZAR AGORA'}
                </button>
                <button className="px-6 py-5 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all">⚙️</button>
             </div>
          </div>
        ))}

        <div className="bg-slate-50 rounded-[50px] border-4 border-dashed border-white flex flex-col items-center justify-center p-12 text-center opacity-60">
           <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-3xl mb-6 shadow-sm">➕</div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conectar HubSpot ou RD Station</p>
        </div>
      </div>
    </div>
  );
};

export default IntegrationCRM;
