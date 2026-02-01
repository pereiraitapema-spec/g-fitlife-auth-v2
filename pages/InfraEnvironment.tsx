
import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { SystemSettings } from '../types';

const InfraEnvironment: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await storeService.getSettings();
      setSettings(data);
    };
    load();
  }, []);

  const handleEnvChange = async (env: any) => {
    // Fix: Await updateEnvironment
    await storeService.updateEnvironment(env);
    const data = await storeService.getSettings();
    setSettings(data);
  };

  if (!settings) return null;

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Arquitetura de Ambientes</h2>
          <p className="text-slate-500 font-medium">Controle de fluxos entre produção, testes e desenvolvimento.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { key: 'production', label: 'Produção', desc: 'Servidores ativos com tráfego real.', color: 'emerald' },
          { key: 'staging', label: 'Staging', desc: 'Réplica de produção para validação final.', color: 'blue' },
          { key: 'development', label: 'Desenvolvimento', desc: 'Ambiente local para novas features.', color: 'amber' },
        ].map(env => (
          <button 
            key={env.key}
            onClick={() => handleEnvChange(env.key)}
            className={`p-10 rounded-[50px] border-4 text-left transition-all relative overflow-hidden group ${
              settings.environment === env.key 
                ? `bg-slate-900 border-${env.color}-500 text-white shadow-2xl` 
                : 'bg-white border-slate-100 hover:border-slate-200 text-slate-900'
            }`}
          >
            {settings.environment === env.key && (
               <div className={`absolute top-0 right-0 p-6 text-[10px] font-black uppercase tracking-widest text-${env.color}-400`}>Ambiente Ativo</div>
            )}
            <h3 className="text-2xl font-black mb-2 tracking-tight">{env.label}</h3>
            <p className={`text-sm font-medium ${settings.environment === env.key ? 'text-slate-400' : 'text-slate-500'}`}>{env.desc}</p>
            <div className={`mt-10 w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
              settings.environment === env.key ? `bg-${env.color}-500/20 text-${env.color}-500` : 'bg-slate-100 text-slate-400'
            }`}>
              {env.key === 'production' ? '🚀' : env.key === 'staging' ? '⚖️' : '🛠️'}
            </div>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[60px] p-12 border border-slate-100 shadow-xl space-y-10">
         <h3 className="text-xl font-black text-slate-900">Configurações de Rede & API</h3>
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">API Endpoint URL</label>
               <input readOnly value="https://api.gfitlife.enterprise.io/v9" className="w-full bg-slate-50 rounded-3xl p-6 font-mono text-xs text-slate-600 outline-none" />
            </div>
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">CDN Edge Nodes</label>
               <div className="flex gap-2">
                  <span className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">São Paulo-1</span>
                  <span className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">Virginia-1 (Backup)</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default InfraEnvironment;
