
import React from 'react';

const FinanceReports: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-700 space-y-12">
      <div className="bg-slate-900 rounded-[50px] p-16 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[150px] -mr-32 -mt-32"></div>
        <h2 className="text-4xl font-black mb-4 tracking-tight">Relatórios Financeiros</h2>
        <p className="text-slate-400 font-medium max-w-2xl mb-12">Análise macro das operações de faturamento e lucro da G-FitLife.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {[
            { label: 'Faturamento Bruto', val: 'R$ 42.150', color: 'text-emerald-400' },
            { label: 'Ticket Médio', val: 'R$ 289,90', color: 'text-blue-400' },
            { label: 'Taxa de Chargeback', val: '0.2%', color: 'text-red-400' },
          ].map((s, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-[36px] hover:bg-white/10 transition-all">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">{s.label}</p>
              <p className={`text-3xl font-black ${s.color} tracking-tighter`}>{s.val}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[60px] p-20 border border-slate-100 text-center space-y-6 shadow-sm grayscale opacity-60">
        <div className="text-6xl">📊</div>
        <h3 className="text-2xl font-black text-slate-900">Análise de Fluxo de Caixa</h3>
        <p className="text-slate-500 max-w-sm mx-auto font-medium">O módulo de Business Intelligence financeiro está sendo sincronizado com o Studio Backend.</p>
        <div className="flex justify-center gap-4">
           <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed">Exportar DRE</button>
           <button className="px-8 py-4 bg-slate-100 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed">Exportar Balanço</button>
        </div>
      </div>
    </div>
  );
};

export default FinanceReports;
