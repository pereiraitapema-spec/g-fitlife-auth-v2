
import React, { useEffect, useState } from 'react';
import { storeService } from '../services/storeService';
import { HelpTopic } from '../types';

const HelpCoreDetail: React.FC = () => {
  const [topic, setTopic] = useState<HelpTopic | null>(null);

  /* Fix: updated to await getHelpTopic */
  useEffect(() => {
    const load = async () => {
      const data = await storeService.getHelpTopic('help-core-detail');
      if (data) setTopic(data);
    };
    load();
  }, []);

  if (!topic) return <div className="p-20 text-center font-black">Carregando documentação do banco...</div>;

  return (
    <div className="animate-in fade-in duration-700 space-y-12">
      <div className="flex items-center gap-6 border-b border-slate-100 pb-10">
        <div className="w-20 h-20 bg-emerald-500 text-white rounded-[32px] flex items-center justify-center text-4xl shadow-xl shadow-emerald-500/20">📘</div>
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">{topic.title}</h2>
          <p className="text-slate-500 text-lg font-medium">{topic.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <section className="bg-white rounded-[50px] border border-slate-100 p-12 shadow-sm space-y-10">
            <h3 className="text-2xl font-black text-slate-900">Manual de Operações CORE</h3>
            <p className="text-slate-600 text-lg leading-relaxed">{topic.content.mainDescription}</p>

            <div className="space-y-12">
               {topic.content.submodules.map((sub: any, idx: number) => (
                 <div key={idx} className="space-y-6">
                    <div className="flex items-center gap-4">
                       <span className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black">{idx + 1}</span>
                       <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">{sub.name}</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-14">
                       {sub.items.map((item: string, i: number) => (
                         <div key={i} className="flex gap-3 text-sm font-medium text-slate-500">
                            <span className="text-emerald-500 shrink-0">•</span>
                            <span>{item}</span>
                         </div>
                       ))}
                    </div>
                 </div>
               ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-8 bg-emerald-50 rounded-[40px] border border-emerald-100">
                <h4 className="text-sm font-black text-emerald-700 uppercase tracking-widest mb-4">Mídia</h4>
                <ul className="space-y-2 text-[10px] font-bold text-emerald-600">
                    <li>• Upload direto PC.</li>
                    <li>• JPG, PNG, WEBP.</li>
                    <li>• Persistência Backend.</li>
                </ul>
              </div>

              <div className="p-8 bg-blue-50 rounded-[40px] border border-blue-100">
                <h4 className="text-sm font-black text-blue-700 uppercase tracking-widest mb-4">UX & Scroll</h4>
                <ul className="space-y-2 text-[10px] font-bold text-blue-600">
                    <li>• Layout Expansivo.</li>
                    <li>• Scroll Contínuo.</li>
                    <li>• Ilimitado: Sem Trava de 2.</li>
                </ul>
              </div>

              <div className="p-8 bg-purple-50 rounded-[40px] border border-purple-100">
                <h4 className="text-sm font-black text-purple-700 uppercase tracking-widest mb-4">Acesso</h4>
                <ul className="space-y-2 text-[10px] font-bold text-purple-600">
                    <li>• Login Validado.</li>
                    <li>• E-mail / Google SSO.</li>
                    <li>• 1º Acesso: 121212.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-slate-900 rounded-[50px] p-12 text-white shadow-2xl space-y-8">
             <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-emerald-400">Auditoria de Hotfix (Core)</h3>
                <span className="px-4 py-2 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-400">Versão: 1.9-Unlimited</span>
             </div>
             <div className="bg-black/40 rounded-3xl p-8 border border-white/5 space-y-6">
                <div>
                   <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Correção de Limite de Cadastro</p>
                   <p className="font-mono text-[11px] leading-relaxed text-emerald-500/80 italic">
                    "CORREÇÃO — CORE > USUÁRIOS (LIMITE DE CRIAÇÃO). Objetivo: Remover trava de 2 registros. Regra: Aceitar usuários ilimitados via append no localStorage['core_users']. Feedback visual (popup) obrigatório em todas as ações de sucesso/erro. Lista com scroll H/V garantido."
                   </p>
                </div>
             </div>
             <div className="flex justify-end">
                <button className="text-xs font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">EDITAR REGISTRO</button>
             </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Metadata de Controle</h4>
              <div className="space-y-4">
                 <div className="flex justify-between text-sm font-bold">
                    <span className="text-slate-400">Status:</span>
                    <span className="text-emerald-600">EXPANDIDO</span>
                 </div>
                 <div className="flex justify-between text-sm font-bold">
                    <span className="text-slate-400">Versão:</span>
                    <span className="text-slate-900">V1.9-Unlimited</span>
                 </div>
                 <div className="flex justify-between text-sm font-bold">
                    <span className="text-slate-400">Atualizado em:</span>
                    <span className="text-slate-900">{new Date().toLocaleDateString()}</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCoreDetail;
