
import React from 'react';

const AffiliatesReports: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="bg-white rounded-[60px] p-20 border-2 border-dashed border-slate-100 text-center space-y-8 shadow-inner">
        <div className="w-32 h-32 bg-slate-50 rounded-[40px] flex items-center justify-center text-6xl mx-auto shadow-sm">📊</div>
        <div className="space-y-4">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Módulo de Business Intelligence</h2>
          <p className="text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
            Estamos consolidando os dados de performance de rede. Em breve você terá acesso a gráficos interativos e exportação em CSV para análise de ROI.
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <div className="px-8 py-4 bg-slate-100 rounded-3xl font-black text-xs text-slate-400 uppercase tracking-widest cursor-not-allowed">EXPORTAR PDF</div>
          <div className="px-8 py-4 bg-slate-100 rounded-3xl font-black text-xs text-slate-400 uppercase tracking-widest cursor-not-allowed">EXPORTAR CSV</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-slate-900 rounded-[50px] p-12 text-white shadow-2xl overflow-hidden relative group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl transition-all group-hover:scale-150"></div>
           <h4 className="text-xl font-black mb-6 border-b border-white/10 pb-4">Top Afiliados (Mês)</h4>
           <p className="text-slate-400 text-sm font-medium">Os dados serão preenchidos conforme o volume de vendas crescer no Sistema do Studio.</p>
        </div>
        <div className="bg-white rounded-[50px] p-12 border border-slate-100 shadow-xl overflow-hidden relative group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl transition-all group-hover:scale-150"></div>
           <h4 className="text-xl font-black mb-6 border-b border-slate-100 pb-4 text-slate-900">Conversão por Canal</h4>
           <p className="text-slate-500 text-sm font-medium">Mapeamento de cliques vindo de redes sociais e blogs de parceiros.</p>
        </div>
      </div>
    </div>
  );
};

export default AffiliatesReports;
