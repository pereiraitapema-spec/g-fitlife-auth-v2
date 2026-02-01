
import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { SystemSettings } from '../types';

const PWASettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);

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
    alert('Configurações PWA salvas no backend!');
  };

  if (!settings) return null;

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Aparência do App (PWA)</h2>
          <p className="text-slate-500 font-medium">Configure como o G-FitLife aparece no dispositivo do usuário.</p>
        </div>
        <button onClick={handleSave} className="px-10 py-5 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl">SALVAR MOBILE</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-white rounded-[50px] border border-slate-100 p-10 shadow-sm space-y-8">
           <h3 className="text-xl font-black text-slate-900 border-b border-slate-50 pb-4">Identidade Visual</h3>
           <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Nome Curto (Display)</label>
                <input value={settings.companyName} onChange={e => setSettings({...settings, companyName: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 outline-none font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-8 bg-slate-900 rounded-3xl flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-black text-xl">G</div>
                    <p className="text-[10px] text-white font-black uppercase tracking-widest">Splash Screen</p>
                 </div>
                 <div className="p-8 bg-white border border-slate-100 rounded-3xl flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-black text-sm">G</div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">App Icon</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="bg-white rounded-[50px] border border-slate-100 p-10 shadow-sm space-y-8">
           <h3 className="text-xl font-black text-slate-900 border-b border-slate-50 pb-4">Comportamento de Carga</h3>
           <div className="space-y-4">
              {[
                { label: 'Ocultar barra de status (iOS)', active: true },
                { label: 'Forçar orientação Vertical', active: true },
                { label: 'Mostrar Splash Screen no Boot', active: true },
                { label: 'Ativar Cache de Assets (Offline)', active: true }
              ].map((opt, i) => (
                <div key={i} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl">
                   <span className="text-sm font-bold text-slate-700">{opt.label}</span>
                   <div className="w-12 h-6 bg-emerald-500 rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default PWASettings;
