
import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Boas-vindas */}
      <section>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Olá, Administrador 👋</h2>
        <p className="text-slate-500">Bem-vindo ao centro de controle da G-FitLife. Aqui está o resumo de hoje.</p>
      </section>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Vendas Hoje', value: 'R$ 12.450', color: 'bg-emerald-500', icon: '💰' },
          { label: 'Novos Clientes', value: '142', color: 'bg-blue-500', icon: '👤' },
          { label: 'Produtos Ativos', value: '85', color: 'bg-amber-500', icon: '📦' },
          { label: 'Taxa Conversão', value: '4.2%', color: 'bg-purple-500', icon: '📈' },
        ].map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 ${card.color} rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-current/10`}>
                {card.icon}
              </div>
              <span className="text-emerald-500 text-xs font-bold">+12%</span>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{card.label}</p>
            <p className="text-2xl font-black text-slate-800">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Placeholder de Atividade Recente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-8 h-[300px] flex items-center justify-center border-dashed">
          <div className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-slate-400 font-medium">Gráfico de Performance em breve...</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 h-[300px] flex items-center justify-center border-dashed">
           <div className="text-center">
            <div className="text-4xl mb-4">🔔</div>
            <p className="text-slate-400 font-medium">Alertas do Sistema...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
