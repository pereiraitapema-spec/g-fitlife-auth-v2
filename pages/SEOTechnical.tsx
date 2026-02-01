
import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { SystemSettings } from '../types';

const SEOTechnical: React.FC = () => {
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
    alert('SEO Técnico atualizado!');
  };

  if (!settings) return null;

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">SEO Técnico & Crawling</h2>
          <p className="text-slate-500 font-medium">Controle a indexação do seu site através de arquivos estruturais.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-white rounded-[50px] border border-slate-100 shadow-xl p-10 space-y-8">
          <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl">🤖</div>
            <h3 className="text-xl font-black text-slate-900">Configuração Robots.txt</h3>
          </div>
          <p className="text-sm text-slate-400 font-medium leading-relaxed italic">Instruções para bots de busca sobre quais pastas podem ou não ser acessadas.</p>
          <textarea 
            // @ts-ignore - RobotsTxt might be in extended settings
            value={settings.robotsTxt || ''} 
            // @ts-ignore
            onChange={e => setSettings({...settings, robotsTxt: e.target.value})}
            className="w-full bg-slate-50 rounded-3xl p-8 outline-none font-mono text-xs text-slate-600 h-64 border-2 border-transparent focus:border-emerald-500 transition-all shadow-inner"
          />
          <button onClick={handleSave} className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black hover:bg-emerald-500 transition-all shadow-xl">ATUALIZAR ARQUIVO</button>
        </div>

        <div className="bg-white rounded-[50px] border border-slate-100 shadow-xl p-10 space-y-8">
           <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-xl">🗺️</div>
            <h3 className="text-xl font-black text-slate-900">Sitemap Automático</h3>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-slate-500 font-medium leading-relaxed">O G-FitLife Enterprise gera automaticamente um sitemap XML baseado em seus produtos e categorias ativos.</p>
            <div className="p-8 bg-slate-900 rounded-3xl text-[10px] font-mono text-emerald-400 overflow-hidden shadow-2xl">
              <pre>{`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://gfitlife.com/</loc></url>
  <url><loc>https://gfitlife.com/suplementacao</loc></url>
  <url><loc>https://gfitlife.com/whey-isolate-pro</loc></url>
</urlset>`}</pre>
            </div>
            <div className="p-6 bg-emerald-50 rounded-2xl flex justify-between items-center border border-emerald-100">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Estado do Sitemap</span>
              <span className="text-xs font-bold text-emerald-500 uppercase">SINCRONIZADO</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEOTechnical;
