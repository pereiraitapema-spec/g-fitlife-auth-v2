
import React, { useState, useEffect } from 'react';
import { Lead, RemarketingLog, EmailTemplate } from '../types';
import { storeService } from '../services/storeService';

const MarketingRemarketing: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [logs, setLogs] = useState<RemarketingLog[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);

  useEffect(() => {
    // Adicionado await para resolver as promises do storeService
    const load = async () => {
      setLeads(await storeService.getLeads());
      setLogs(await storeService.getRemarketingLogs());
      setTemplates(await storeService.getTemplates());
    };
    load();
  }, []);

  const triggerManualRecuperation = async (lead: Lead) => {
    // Adicionado await para garantir a execução e atualização correta do estado
    await storeService.triggerRemarketing(lead);
    setLogs(await storeService.getRemarketingLogs());
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Automação de Recuperação</h2>
          <p className="text-slate-500 font-medium">Recupere visitantes que visualizaram produtos mas não compraram.</p>
        </div>
        <div className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
          Recuperação Automática: Ligada
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-8 space-y-6">
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <p className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 bg-slate-50/50">Leads em Potencial (Não Convertidos)</p>
            <table className="w-full text-left">
              <tbody className="divide-y divide-slate-50">
                {leads.filter(l => !l.converted).map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-6">
                      <p className="font-black text-slate-800 text-sm">{lead.email}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Visitou: {lead.productName}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => triggerManualRecuperation(lead)}
                        className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all"
                      >
                        RECUPERAR AGORA
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
             <p className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 bg-slate-50/50">Histórico de Disparos (Studio AI Remarketing)</p>
             <div className="p-8 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                {logs.length === 0 && <p className="text-center py-10 text-slate-300 font-black text-xs uppercase tracking-widest">Nenhum disparo registrado.</p>}
                {logs.map(log => (
                  <div key={log.id} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex gap-4 items-center">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-lg shadow-sm">📩</div>
                      <div>
                        <p className="text-xs font-black text-slate-800">{log.leadEmail}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{log.productName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">ENVIADO</span>
                      <p className="text-[9px] text-slate-400 font-bold mt-1">{new Date(log.sentAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-6">
           <div className="bg-slate-900 rounded-[50px] p-10 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
             <h3 className="text-xl font-black mb-8 border-b border-white/10 pb-6 tracking-tight">Regras de Negócio</h3>
             <div className="space-y-6">
               <div className="space-y-2">
                 <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Gatilho de Tempo</p>
                 <p className="text-xs font-bold text-slate-300">O sistema monitora leads e envia a primeira abordagem 48h após a última visita.</p>
               </div>
               <div className="space-y-2">
                 <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Exclusão Automática</p>
                 <p className="text-xs font-bold text-slate-300">Leads que converteram em pedido nos últimos 7 dias são ignorados pela automação.</p>
               </div>
             </div>
           </div>

           <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-xl space-y-6">
             <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-4">Template Ativo</h3>
             <div className="space-y-4">
                {templates.map(t => (
                  <div key={t.id} className="space-y-3">
                    <p className="text-xs font-black text-slate-400 uppercase">Assunto: {t.subject}</p>
                    <div className="p-4 bg-slate-50 rounded-xl text-[10px] font-bold text-slate-500 italic leading-relaxed">
                      {t.body}
                    </div>
                  </div>
                ))}
             </div>
             <button className="w-full py-4 bg-slate-100 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">EDITAR TEMPLATES</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingRemarketing;
