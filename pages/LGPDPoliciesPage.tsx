
import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { SystemSettings } from '../types';

const LGPDPoliciesPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'policy' | 'terms'>('policy');

  useEffect(() => {
    const load = async () => {
      const data = await storeService.getSettings();
      setSettings(data);
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    await storeService.saveSettings(settings);
    // Fix: Await logLGPD
    await storeService.logLGPD('consent', 'admin', `Políticas legais atualizadas via painel.`);
    alert('Políticas atualizadas no banco de dados!');
  };

  if (!settings) return null;

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Políticas & Jurídico</h2>
          <p className="text-slate-500 font-medium">Gestão de textos legais e diretrizes de uso da plataforma.</p>
        </div>
        <button onClick={handleSave} className="px-10 py-5 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl active:scale-95">SALVAR POLÍTICAS</button>
      </div>

      <div className="bg-white rounded-[50px] border border-slate-100 shadow-xl overflow-hidden flex flex-col">
         <div className="flex border-b border-slate-100">
            <button 
              onClick={() => setActiveTab('policy')}
              className={`flex-1 py-8 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'policy' ? 'bg-slate-50 text-emerald-500 border-b-4 border-emerald-500' : 'text-slate-400 hover:text-slate-900'}`}
            >
              Política de Privacidade
            </button>
            <button 
              onClick={() => setActiveTab('terms')}
              className={`flex-1 py-8 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'terms' ? 'bg-slate-50 text-emerald-500 border-b-4 border-emerald-500' : 'text-slate-400 hover:text-slate-900'}`}
            >
              Termos de Uso
            </button>
         </div>
         
         <div className="p-10">
            {activeTab === 'policy' ? (
              <textarea 
                value={settings.privacyPolicy}
                onChange={e => setSettings({...settings, privacyPolicy: e.target.value})}
                className="w-full h-[500px] bg-slate-50 border-none rounded-[40px] p-10 font-mono text-sm text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
              />
            ) : (
              <textarea 
                value={settings.termsOfUse}
                onChange={e => setSettings({...settings, termsOfUse: e.target.value})}
                className="w-full h-[500px] bg-slate-50 border-none rounded-[40px] p-10 font-mono text-sm text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
              />
            )}
         </div>
      </div>
    </div>
  );
};

export default LGPDPoliciesPage;
