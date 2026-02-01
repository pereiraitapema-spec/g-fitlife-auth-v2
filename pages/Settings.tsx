
import React, { useState, useEffect } from 'react';
import { SystemSettings } from '../types';
import { storeService } from '../services/storeService';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await storeService.getSettings();
      setSettings(data);
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    await storeService.saveSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  if (!settings) return null;

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Configurações Gerais</h2>
          <p className="text-slate-500">Persistência gerenciada pelo Studio Backend.</p>
        </div>
        {isSaved && (
          <span className="px-4 py-1.5 bg-emerald-100 text-emerald-600 rounded-full text-xs font-bold">✓ Atualizado</span>
        )}
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
        <form onSubmit={handleSave} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Nome do Sistema</label>
              <input value={settings.companyName} onChange={e => setSettings({...settings, companyName: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-emerald-500 font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">E-mail Administrativo</label>
              <input value={settings.adminEmail} onChange={e => setSettings({...settings, adminEmail: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-emerald-500 font-bold" />
            </div>
          </div>
          <button type="submit" className="px-10 py-5 bg-slate-900 text-white rounded-3xl font-black hover:bg-emerald-500 transition-all shadow-xl">SALVAR NO BACKEND</button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
