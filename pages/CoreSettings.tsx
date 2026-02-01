
import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { SystemSettings } from '../types';
import FileUpload from '../components/FileUpload';

const CoreSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const data = await storeService.getSettings();
      setSettings(data);
    } catch (error) {
      showFeedback("Falha ao carregar configurações", "error");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showFeedback = (msg: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message: msg, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !settings) return;
    
    setIsSubmitting(true);
    try {
      await storeService.saveSettings(settings);
      await loadData(); // Rebusca imediata para garantir sincronia
      showFeedback("Configurações salvas com sucesso (IndexedDB)");
    } catch (error) {
      showFeedback("Erro ao salvar no banco: " + error, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!settings) {
    return (
      <div className="p-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Sincronizando Core...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 pb-20 relative">
      {/* POPUP DE FEEDBACK */}
      {feedback && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-top-10">
          <div className={`px-10 py-5 rounded-[40px] shadow-2xl border flex items-center gap-4 ${
            feedback.type === 'error' ? 'bg-red-500 border-red-400 text-white' : 'bg-slate-900 border-emerald-500 text-white'
          }`}>
             <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-black">
                {feedback.type === 'success' ? '✓' : '!'}
             </div>
             <span className="font-black text-xs uppercase tracking-widest">{feedback.message}</span>
          </div>
        </div>
      )}

      <div className="mb-10 px-4">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-4 uppercase">Configurações Gerais</h2>
        <p className="text-slate-500 text-lg font-medium">Controle total da identidade e canais de atendimento do ecossistema.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-10 max-w-6xl">
        {/* SEÇÃO 1: IDENTIDADE VISUAL */}
        <div className="bg-white rounded-[50px] border border-slate-100 p-10 md:p-12 shadow-sm space-y-10">
           <div className="flex items-center gap-4 border-b border-slate-50 pb-6 mb-2">
              <span className="text-2xl">🖼️</span>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Marca e Identidade</h3>
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-10">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Nome da Loja</label>
                    <input 
                      required 
                      disabled={isSubmitting} 
                      value={settings.nomeLoja} 
                      onChange={e => setSettings({...settings, nomeLoja: e.target.value})} 
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-[24px] p-6 text-xl font-black outline-none shadow-inner transition-all" 
                      placeholder="Ex: G-FitLife Store"
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Domínio Oficial (URL)</label>
                    <input 
                      required 
                      disabled={isSubmitting} 
                      value={settings.dominio} 
                      onChange={e => setSettings({...settings, dominio: e.target.value})} 
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-[24px] p-6 font-bold outline-none shadow-inner transition-all" 
                      placeholder="Ex: gfitlife.com.br"
                    />
                 </div>
              </div>

              <div>
                 <FileUpload 
                    label="Logo da Plataforma" 
                    currentUrl={settings.logoUrl} 
                    onUploadComplete={(url) => setSettings({...settings, logoUrl: url})} 
                 />
              </div>
           </div>
        </div>

        {/* SEÇÃO 2: ATENDIMENTO E CONTATO */}
        <div className="bg-white rounded-[50px] border border-slate-100 p-10 md:p-12 shadow-sm space-y-10">
           <div className="flex items-center gap-4 border-b border-slate-50 pb-6 mb-2">
              <span className="text-2xl">📞</span>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Canais de Atendimento</h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email de Contato</label>
                 <input 
                   required 
                   type="email"
                   disabled={isSubmitting} 
                   value={settings.emailContato} 
                   onChange={e => setSettings({...settings, emailContato: e.target.value})} 
                   className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-[24px] p-6 font-bold outline-none shadow-inner transition-all" 
                 />
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Telefone Fixo</label>
                 <input 
                   disabled={isSubmitting} 
                   value={settings.telefone} 
                   onChange={e => setSettings({...settings, telefone: e.target.value})} 
                   className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-[24px] p-6 font-bold outline-none shadow-inner transition-all" 
                   placeholder="(00) 0000-0000"
                 />
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">WhatsApp (Link IA)</label>
                 <input 
                   required 
                   disabled={isSubmitting} 
                   value={settings.whatsapp} 
                   onChange={e => setSettings({...settings, whatsapp: e.target.value})} 
                   className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-[24px] p-6 font-bold outline-none shadow-inner transition-all" 
                   placeholder="(00) 00000-0000"
                 />
              </div>
           </div>
        </div>

        {/* SEÇÃO 3: PARÂMETROS REGIONAIS */}
        <div className="bg-white rounded-[50px] border border-slate-100 p-10 md:p-12 shadow-sm space-y-10">
           <div className="flex items-center gap-4 border-b border-slate-50 pb-6 mb-2">
              <span className="text-2xl">🌍</span>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Regionalização</h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Moeda Padrão</label>
                 <select 
                   value={settings.moeda} 
                   onChange={e => setSettings({...settings, moeda: e.target.value as any})} 
                   className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-[24px] p-6 font-black outline-none appearance-none cursor-pointer shadow-inner transition-all"
                 >
                    <option value="BRL">REAL (BRL - R$)</option>
                    <option value="USD">DÓLAR (USD - $)</option>
                    <option value="EUR">EURO (EUR - €)</option>
                 </select>
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Fuso Horário (Logs)</label>
                 <select 
                   value={settings.timezone} 
                   onChange={e => setSettings({...settings, timezone: e.target.value})} 
                   className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-[24px] p-6 font-black outline-none appearance-none cursor-pointer shadow-inner transition-all"
                 >
                    <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                    <option value="America/New_York">New York (GMT-5)</option>
                    <option value="Europe/London">London (GMT+0)</option>
                 </select>
              </div>
           </div>
        </div>

        {/* BOTÃO SALVAR FIXO/DESTAQUE */}
        <div className="flex justify-end pt-6">
           <button 
             type="submit" 
             disabled={isSubmitting} 
             className="w-full md:w-auto px-16 py-8 bg-slate-900 text-white rounded-[32px] font-black text-xl hover:bg-emerald-500 transition-all shadow-2xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 group"
           >
              {isSubmitting ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  PERSISTINDO DADOS...
                </>
              ) : (
                <>
                  SINCRONIZAR CONFIGURAÇÕES
                  <span className="group-hover:translate-x-2 transition-transform">→</span>
                </>
              )}
           </button>
        </div>
      </form>
    </div>
  );
};

export default CoreSettings;
