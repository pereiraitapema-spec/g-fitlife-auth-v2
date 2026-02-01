
import React from 'react';

const HelpCore: React.FC = () => {
  const corePrompt = `Implementar o módulo CORE como base do sistema administrativo da G-FitLife, focando em persistência backend total e RBAC avançado. Estruturar Configurações Gerais (identidade global), Gestão de Usuários (Google/Email) e Matriz de Papéis e Permissões (Roles) que controlam dinamicamente a visibilidade de menus e ações.`;

  return (
    <div className="animate-in fade-in duration-700 space-y-12">
      {/* Header da Documentação */}
      <div className="flex items-center gap-6 border-b border-slate-100 pb-10">
        <div className="w-20 h-20 bg-emerald-500 text-white rounded-[32px] flex items-center justify-center text-4xl shadow-xl shadow-emerald-500/20">📘</div>
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">CORE — Base do Sistema</h2>
          <p className="text-slate-500 text-lg font-medium">Documentação técnica e manual de operações do núcleo administrativo.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Lado Esquerdo: Descrição Geral */}
        <div className="lg:col-span-8 space-y-10">
          <section className="bg-white rounded-[50px] border border-slate-100 p-12 shadow-sm space-y-6">
            <h3 className="text-2xl font-black text-slate-900">Visão Geral</h3>
            <p className="text-slate-600 leading-relaxed text-lg">
              O módulo <strong>Core</strong> é o sistema nervoso da plataforma G-FitLife. Ele é responsável pela fundação de dados que todos os outros módulos (Financeiro, Logística, IA) utilizam para operar. Sem este módulo, o sistema não possui identidade ou controle de acesso.
            </p>
            <div className="p-8 bg-slate-50 rounded-[32px] border-l-8 border-emerald-500">
               <p className="text-sm font-bold text-slate-700 italic">"Tudo no sistema G-FitLife depende do Core: desde o nome da loja que o cliente vê, até quem tem permissão para deletar um pedido."</p>
            </div>
          </section>

          {/* Grid de Submódulos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm space-y-4 hover:border-emerald-500 transition-colors">
               <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl">⚙️</div>
               <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Configurações Gerais</h4>
               <p className="text-sm text-slate-500 leading-relaxed">
                 Define a <strong>identidade global</strong>. Gerencia o nome da plataforma, idioma padrão, fuso horário e a moeda de transação. É aqui que o Admin Master ativa o <strong>Modo de Manutenção</strong>.
               </p>
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm space-y-4 hover:border-emerald-500 transition-colors">
               <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl">👥</div>
               <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Gestão de Usuários</h4>
               <p className="text-sm text-slate-500 leading-relaxed">
                 Controla o <strong>acesso humano</strong>. Permite criar operadores, vendedores e afiliados, definindo se o login será tradicional ou via <strong>Google SSO</strong>. Status inativo bloqueia o login instantaneamente.
               </p>
            </div>
          </div>

          <section className="bg-slate-900 rounded-[50px] p-12 text-white shadow-2xl space-y-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
             <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
               <span className="text-emerald-500">🛡️</span> Papéis & Permissões (RBAC)
             </h3>
             <p className="text-slate-400 leading-relaxed">
               O motor de <strong>Role-Based Access Control</strong> permite que o Admin Master crie perfis de uso granulares. Você pode decidir, por exemplo, que o time de <i>Marketing</i> pode ver pedidos, mas não pode editá-los nem deletar usuários.
             </p>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {['Ver', 'Criar', 'Editar', 'Excluir'].map(act => (
                  <div key={act} className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    Ação: {act}
                  </div>
                ))}
             </div>
             <p className="text-xs text-slate-500 font-medium italic">Nota: Permissões inválidas ocultam menus automaticamente na Sidebar.</p>
          </section>
        </div>

        {/* Lado Direito: Metadata & Prompt */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm space-y-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Referência Técnica</h4>
              <div className="space-y-4">
                 <div className="flex justify-between text-sm font-bold">
                    <span className="text-slate-400">Versão:</span>
                    <span className="text-slate-900">V1.0.4-Core</span>
                 </div>
                 <div className="flex justify-between text-sm font-bold">
                    <span className="text-slate-400">Arquitetura:</span>
                    <span className="text-slate-900">Enterprise Modular</span>
                 </div>
                 <div className="flex justify-between text-sm font-bold">
                    <span className="text-slate-400">Persistência:</span>
                    <span className="text-emerald-600">Sincronizada (Backend)</span>
                 </div>
              </div>
           </div>

           <div className="bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 p-8 space-y-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Prompt do Core (Auditoria)</h4>
              <div className="p-6 bg-slate-900 rounded-3xl">
                 <p className="text-[11px] font-mono text-emerald-500/80 leading-relaxed italic">
                   "{corePrompt}"
                 </p>
              </div>
              <p className="text-[9px] text-slate-400 font-bold uppercase leading-tight">Este prompt foi utilizado pelo Arquiteto para estruturar a base inicial do ecossistema.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCore;
