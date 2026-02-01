
import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { BackupRecord } from '../types';

const InfraBackup: React.FC = () => {
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    // Adicionado await para carregar os backups
    const load = async () => {
      setBackups(await storeService.getBackups());
    };
    load();
  }, []);

  const handleCreateBackup = async () => {
    // Adicionado await e async para garantir a persistência correta
    setIsCreating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    await storeService.createBackup('Snapshot_Global_' + new Date().toLocaleDateString().replace(/\//g, '_'));
    setBackups(await storeService.getBackups());
    setIsCreating(false);
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Pontos de Restauração</h2>
          <p className="text-slate-500 font-medium">Backup persistente de 100% dos dados estruturais.</p>
        </div>
        <button 
          onClick={handleCreateBackup}
          disabled={isCreating}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-emerald-500 transition-all active:scale-95"
        >
          {isCreating ? 'GERANDO SNAPSHOT...' : 'EXECUTAR BACKUP AGORA'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {backups.map(bak => (
            <div key={bak.id} className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-6 text-[9px] font-black uppercase text-emerald-500 bg-emerald-50 rounded-bl-3xl">Audited</div>
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">💾</div>
                  <div>
                     <h4 className="font-black text-slate-800 text-sm truncate max-w-[150px]">{bak.name}</h4>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tamanho: {bak.size}</p>
                  </div>
               </div>
               
               <div className="space-y-4 mb-10">
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     <span>Criado em</span>
                     <span>{new Date(bak.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     <span>Estado</span>
                     <span className="text-emerald-500 font-black">RESILIENTE</span>
                  </div>
               </div>

               <div className="flex gap-3">
                  <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all">RESTAURAR</button>
                  <button className="px-6 py-4 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all">🗑️</button>
               </div>
            </div>
         ))}
      </div>

      <div className="bg-slate-900 rounded-[50px] p-12 text-white shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
         <h3 className="text-xl font-black mb-4">Políticas de Retenção Automatizada</h3>
         <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            O ecossistema G-FitLife realiza backups incrementais de hora em hora e snapshots globais diários. 
            A retenção em nuvem é de 365 dias para backups diários e 30 dias para horários.
         </p>
      </div>
    </div>
  );
};

export default InfraBackup;
