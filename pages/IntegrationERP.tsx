
import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { ExternalAPIConfig } from '../types';

const IntegrationERP: React.FC = () => {
  const [configs, setConfigs] = useState<ExternalAPIConfig[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Adicionado await para carregar e filtrar configurações de ERP
    const load = async () => {
      setConfigs((await storeService.getAPIConfigs()).filter(c => c.type === 'erp'));
    };
    load();
  }, []);

  const handleSync = async (provider: string) => {
    // Adicionado await para garantir a sincronização e atualização do estado
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    await storeService.syncERP(provider);
    setConfigs((await storeService.getAPIConfigs()).filter(c => c.type === 'erp'));
    setIsSyncing(false);
    alert(`Sincronização de pedidos e estoque com ${provider} concluída!`);
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">ERP & Backoffice</h2>
          <p className="text-slate-500 font-medium">Conecte sua loja ao seu sistema de gestão, emissão de notas e estoque.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {configs.map(cfg => (
          <div key={cfg.id} className="bg-white rounded-[50px] border border-slate-100 p-10 shadow-sm space-y-8 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  cfg.status === 'connected' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white shadow-xl shadow-red-500/20'
                }`}>
                  {cfg.status === 'connected' ? 'Online' : 'Erro de Auth'}
                </span>
             </div>
             <div className="flex items-center gap-6 border-b border-slate-50 pb-6">
                <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">🏢</div>
                <div>
                   <h3 className="text-xl font-black text-slate-900">{cfg.provider}</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enterprise Resource Planning</p>
                </div>
             </div>
             
             <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <span>Última Sincronização</span>
                   <span className="text-slate-900">{cfg.lastSync ? new Date(cfg.lastSync).toLocaleString() : 'Nunca'}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <span>Pedidos Exportados</span>
                   <span className="text-emerald-500">242</span>
                </div>
             </div>

             <div className="flex gap-3 pt-4">
                <button 
                  disabled={isSyncing || cfg.status !== 'connected'}
                  onClick={() => handleSync(cfg.provider)}
                  className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all disabled:opacity-50"
                >
                  {isSyncing ? 'EXPORTANDO DADOS...' : 'EXPORTAR PARA ERP'}
                </button>
                <button className="px-6 py-5 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all">⚙️</button>
             </div>
          </div>
        ))}

        <div className="bg-white rounded-[50px] border border-slate-100 p-10 shadow-sm flex flex-col items-center justify-center text-center space-y-4 opacity-50 grayscale">
            <div className="text-5xl">📦</div>
            <h4 className="text-lg font-black text-slate-900">Integração Tiny ERP</h4>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Disponível no Plano Enterprise</p>
            <button disabled className="px-8 py-3 bg-slate-100 text-slate-400 rounded-xl text-[10px] font-black uppercase">Liberar Acesso</button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationERP;
