
import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { DeployRecord, UserSession } from '../types';

interface InfraDeployProps {
  currentUser: UserSession;
}

const InfraDeploy: React.FC<InfraDeployProps> = ({ currentUser }) => {
  const [deploys, setDeploys] = useState<DeployRecord[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [version, setVersion] = useState('9.1.0');
  const [logs, setLogs] = useState('');

  useEffect(() => {
    // Fix: Await deploys
    const load = async () => {
      const data = await storeService.getDeploys();
      setDeploys(data);
    };
    load();
  }, []);

  const handleStartDeploy = async () => {
    setIsDeploying(true);
    // Fix: Await deploy creation and reload
    await new Promise(resolve => setTimeout(resolve, 3000));
    await storeService.createDeploy(version, currentUser.userName, logs || 'Lançamento incremental de infraestrutura.');
    const data = await storeService.getDeploys();
    setDeploys(data);
    setIsDeploying(false);
    setVersion('');
    setLogs('');
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Histórico de Versões</h2>
          <p className="text-slate-500 font-medium">Gestão de builds e rastreabilidade de mudanças.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4">
           <div className="bg-slate-900 rounded-[50px] p-10 text-white shadow-2xl space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <h3 className="text-xl font-black tracking-tight">Novo Deploy</h3>
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Versão do Build</label>
                    <input value={version} onChange={e => setVersion(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none font-bold text-white focus:border-emerald-500 transition-all" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Notas de Lançamento</label>
                    <textarea value={logs} onChange={e => setLogs(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none font-bold text-white h-32 focus:border-emerald-500 transition-all" />
                 </div>
                 <button 
                  disabled={isDeploying}
                  onClick={handleStartDeploy}
                  className="w-full py-6 bg-emerald-500 text-white rounded-[30px] font-black text-sm uppercase tracking-widest shadow-xl hover:bg-emerald-600 transition-all disabled:opacity-50 active:scale-95"
                 >
                   {isDeploying ? 'COMPILANDO PROJETO...' : 'LANÇAR EM PRODUÇÃO'}
                 </button>
              </div>
           </div>
        </div>

        <div className="lg:col-span-8">
           <div className="bg-white rounded-[50px] border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                 <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                       <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Build</th>
                       <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Responsável</th>
                       <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mudanças</th>
                       <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Data</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {deploys.map(dep => (
                       <tr key={dep.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-8 py-6">
                             <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-black tracking-widest">v{dep.version}</span>
                          </td>
                          <td className="px-8 py-6 font-bold text-slate-800 text-sm">{dep.deployedBy}</td>
                          <td className="px-8 py-6">
                             <p className="text-xs text-slate-500 italic max-w-xs truncate">{dep.changelog}</p>
                          </td>
                          <td className="px-8 py-6 text-right font-black text-slate-400 text-[10px]">
                             {new Date(dep.timestamp).toLocaleString()}
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
};

export default InfraDeploy;
