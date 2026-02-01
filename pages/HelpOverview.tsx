
import React, { useEffect, useState } from 'react';
import { storeService } from '../services/storeService';
import { HelpTopic } from '../types';

const HelpOverview: React.FC = () => {
  const [topic, setTopic] = useState<HelpTopic | null>(null);

  /* Fix: updated to await getHelpTopic */
  useEffect(() => {
    const load = async () => {
      const data = await storeService.getHelpTopic('help-overview');
      if (data) setTopic(data);
    };
    load();
  }, []);

  if (!topic) return <div className="p-20 text-center font-black">Carregando documentação do banco...</div>;

  return (
    <div className="animate-in fade-in duration-700 space-y-12">
      <div className="flex items-center gap-6 border-b border-slate-100 pb-10">
        <div className="w-20 h-20 bg-emerald-500 text-white rounded-[32px] flex items-center justify-center text-4xl shadow-xl shadow-emerald-500/20">🌍</div>
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">{topic.title}</h2>
          <p className="text-slate-500 text-lg font-medium">{topic.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <section className="bg-white rounded-[50px] border border-slate-100 p-12 shadow-sm space-y-8">
            <h3 className="text-2xl font-black text-slate-900">Filosofia da Plataforma</h3>
            <p className="text-slate-600 leading-relaxed text-lg">{topic.content.intro}</p>
            
            <div className="p-8 bg-slate-900 rounded-[40px] text-white">
               <h4 className="text-emerald-400 font-black uppercase text-xs tracking-widest mb-4">Arquitetura de Dados</h4>
               <p className="text-slate-300 font-medium leading-relaxed">{topic.content.architecture}</p>
            </div>

            <div className="space-y-4">
               <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Diferenciais Técnicos</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {topic.content.features.map((f: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                       <span className="text-emerald-500">✓</span>
                       <span className="font-bold text-slate-700 text-sm">{f}</span>
                    </div>
                  ))}
               </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="bg-emerald-500 rounded-[40px] p-8 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-all"></div>
              <h4 className="text-lg font-black mb-4">Acesso Multinível</h4>
              <p className="text-sm text-emerald-50 text-white/80 font-medium mb-6 leading-relaxed">
                O sistema utiliza um motor de RBAC (Role-Based Access Control) que filtra dinamicamente todos os componentes da interface baseado no papel do usuário.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default HelpOverview;
