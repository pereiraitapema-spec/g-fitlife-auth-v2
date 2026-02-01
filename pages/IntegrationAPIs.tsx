
import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { ExternalAPIConfig, IntegrationSyncLog } from '../types';

const IntegrationAPIs: React.FC = () => {
  const [configs, setConfigs] = useState<ExternalAPIConfig[]>([]);
  const [logs, setLogs] = useState<IntegrationSyncLog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<ExternalAPIConfig>>({ provider: '', apiKey: '', type: 'crm', status: 'connected' });

  useEffect(() => {
    // Adicionado await para carregar configurações de API e logs de sincronização
    const load = async () => {
      setConfigs(await storeService.getAPIConfigs());
      setLogs(await storeService.getSyncLogs());
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    // Adicionado await para garantir a persistência e recarga correta dos dados
    e.preventDefault();
    const newCfg: ExternalAPIConfig = {
      id: 'API-' + Date.now(),
      provider: formData.provider || '',
      type: formData.type as any,
      apiKey: formData.apiKey || '',
      status: 'connected',
      lastSync: new Date().toISOString()
    };
    await storeService.saveAPIConfig(newCfg);
    setConfigs(await storeService.getAPIConfigs());
    setLogs(await storeService.getSyncLogs());
    setIsModalOpen(false);
    setFormData({ provider: '', apiKey: '', type: 'crm' });
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">API Management Hub</h2>
          <p className="text-slate-500 font-medium">Gerencie tokens, chaves de acesso e audite o tráfego de dados externo.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-emerald-500 transition-all active:scale-95"
        >
          + NOVA CHAVE API
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         <div className="lg:col-span-4 space-y-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Conexões Ativas</p>
            <div className="space-y-3">
               {configs.map(cfg => (
                  <div key={cfg.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm group hover:border-emerald-500 transition-all">
                     <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl">🔑</div>
                        <span className={`w-3 h-3 rounded-full ${cfg.status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                     </div>
                     <h4 className="font-black text-slate-900 text-sm">{cfg.provider}</h4>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Token: ****{cfg.apiKey.slice(-4)}</p>
                  </div>
               ))}
            </div>
         </div>

         <div className="lg:col-span-8">
            <div className="bg-slate-900 rounded-[50px] shadow-2xl overflow-hidden border border-white/5">
               <div className="px-8 py-6 bg-white/5 border-b border-white/5 flex justify-between items-center">
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Sync Audit Trail</p>
                  <div className="flex items-center gap-3">
                     <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
                     <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Real-time Sockets</span>
                  </div>
               </div>
               <div className="p-8 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar font-mono">
                  {logs.map(log => (
                    <div key={log.id} className="flex gap-6 p-4 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10">
                       <span className="text-slate-500 text-[10px] pt-1">{new Date(log.timestamp).toLocaleTimeString()}</span>
                       <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded h-fit ${
                         log.status === 'failed' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                       }`}>
                         {log.status}
                       </span>
                       <div className="flex-1">
                         <p className="text-slate-200 text-sm font-medium">{log.message}</p>
                         <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">{log.provider} • {log.type}</p>
                       </div>
                    </div>
                  ))}
                  {logs.length === 0 && <p className="text-center py-20 text-slate-700 font-black uppercase tracking-widest">Aguardando telemetria de APIs...</p>}
               </div>
            </div>
         </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[50px] shadow-2xl p-10 animate-in zoom-in-95">
            <h3 className="text-2xl font-black mb-8">Registrar API Key</h3>
            <form onSubmit={handleSave} className="space-y-6">
              <input required placeholder="Provedor (Ex: RD Station)" value={formData.provider} onChange={e => setFormData({...formData, provider: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 outline-none font-bold" />
              <input required placeholder="Token / API Key" value={formData.apiKey} onChange={e => setFormData({...formData, apiKey: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 outline-none font-bold" />
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Tipo de Integração</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})} className="w-full bg-slate-50 rounded-2xl p-5 outline-none font-bold">
                   <option value="crm">CRM / Marketing</option>
                   <option value="whatsapp">WhatsApp Business</option>
                   <option value="erp">ERP / Gestão</option>
                   <option value="other">Outros</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black hover:bg-emerald-500 transition-all">SALVAR CREDENCIAIS</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-5 bg-slate-100 text-slate-500 rounded-2xl font-bold">CANCELAR</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationAPIs;
