
import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { Affiliate, Commission, Order } from '../types';

interface AffiliateStats {
  affiliateId: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSalesVolume: number;
  totalCommission: number;
  balance: number;
}

const AffiliatesReports: React.FC = () => {
  const [stats, setStats] = useState<AffiliateStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState({
    totalVolume: 0,
    totalCommissions: 0,
    activePartners: 0
  });

  const loadReportData = async () => {
    setLoading(true);
    try {
      const [affiliates, commissions, orders] = await Promise.all([
        storeService.getAffiliates(),
        storeService.getCommissions(),
        storeService.getOrders()
      ]);

      const activeAffiliates = affiliates.filter(a => a.status === 'active');
      
      const calculatedStats = activeAffiliates.map(aff => {
        const affCommissions = commissions.filter(c => c.affiliateId === aff.id && c.status !== 'canceled');
        const affOrders = orders.filter(o => o.affiliateId === aff.id && o.status !== 'canceled');

        return {
          affiliateId: aff.id,
          name: aff.name,
          email: aff.email,
          totalOrders: affOrders.length,
          totalSalesVolume: affOrders.reduce((sum, o) => sum + o.finalTotal, 0),
          totalCommission: affCommissions.reduce((sum, c) => sum + c.amount, 0),
          balance: aff.balance
        };
      });

      setStats(calculatedStats.sort((a, b) => b.totalSalesVolume - a.totalSalesVolume));
      
      setGlobalStats({
        totalVolume: calculatedStats.reduce((sum, s) => sum + s.totalSalesVolume, 0),
        totalCommissions: calculatedStats.reduce((sum, s) => sum + s.totalCommission, 0),
        activePartners: activeAffiliates.length
      });
    } catch (error) {
      console.error("Erro ao gerar relatórios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Processando Business Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 space-y-10 pb-20">
      {/* Header do Relatório */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">BI — Desempenho de Rede</h2>
          <p className="text-slate-500 font-medium">Análise macro de conversão e lucratividade dos parceiros G-FitLife.</p>
        </div>
        <button 
          onClick={loadReportData}
          className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
        >
          Sincronizar Dados
        </button>
      </div>

      {/* Cards de Performance Global */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Volume Total Ref', val: `R$ ${globalStats.totalVolume.toFixed(2)}`, icon: '📈', color: 'bg-blue-500' },
          { label: 'Comissões Geradas', val: `R$ ${globalStats.totalCommissions.toFixed(2)}`, icon: '💸', color: 'bg-emerald-500' },
          { label: 'Parceiros Ativos', val: globalStats.activePartners, icon: '🤝', color: 'bg-slate-900' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
            <div className={`w-16 h-16 ${s.color} rounded-3xl flex items-center justify-center text-3xl shadow-lg shadow-current/10 group-hover:scale-110 transition-transform`}>
              {s.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabela de BI por Afiliado */}
      <div className="bg-white rounded-[50px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ranking de Performance (Vendas)</p>
          <div className="flex gap-4">
             <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">Exportar CSV</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white border-b border-slate-50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Parceiro</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Vendas</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Faturamento</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Comissão Acum.</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Saldo Atual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stats.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-300 font-black text-xs uppercase tracking-widest grayscale opacity-40">
                    Nenhum dado de conversão disponível para processamento.
                  </td>
                </tr>
              ) : (
                stats.map((item, idx) => (
                  <tr key={item.affiliateId} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-black text-slate-800 text-sm">{item.name}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-bold">{item.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="px-4 py-1.5 bg-slate-100 rounded-full text-xs font-black text-slate-600">
                        {item.totalOrders}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <p className="font-black text-slate-900">R$ {item.totalSalesVolume.toFixed(2)}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <p className="font-black text-emerald-600">R$ {item.totalCommission.toFixed(2)}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="px-4 py-2 bg-emerald-50 rounded-2xl inline-block border border-emerald-100">
                        <p className="text-xs font-black text-emerald-700">R$ {item.balance.toFixed(2)}</p>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights e Predições Visuais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-slate-900 rounded-[50px] p-12 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[100px] transition-all group-hover:scale-150"></div>
          <h4 className="text-xl font-black mb-8 border-b border-white/10 pb-4 uppercase tracking-tight">Distribuição de Lucro</h4>
          <div className="space-y-6">
             <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                   <span>G-FitLife Hub (Fee)</span>
                   <span>85%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                   <div className="bg-blue-500 h-full w-[85%]"></div>
                </div>
             </div>
             <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                   <span>Parceiros (Comissões)</span>
                   <span>15%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                   <div className="bg-emerald-500 h-full w-[15%]"></div>
                </div>
             </div>
          </div>
          <p className="mt-10 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Cálculo baseado em margem média líquida.</p>
        </div>

        <div className="bg-white rounded-[50px] p-12 border border-slate-100 shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-[100px] transition-all group-hover:scale-150"></div>
          <h4 className="text-xl font-black mb-8 border-b border-slate-100 pb-4 text-slate-900 uppercase tracking-tight">Previsão de Payout</h4>
          <div className="flex items-center gap-8 h-40">
             {[30, 50, 45, 70, 60, 85, 95].map((h, i) => (
                <div key={i} className="flex-1 bg-slate-50 rounded-t-2xl relative group/bar hover:bg-emerald-500 transition-all cursor-pointer shadow-inner" style={{ height: `${h}%` }}>
                   <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-all bg-slate-900 text-white text-[9px] px-2 py-1 rounded font-black">
                      {h}%
                   </div>
                </div>
             ))}
          </div>
          <div className="flex justify-between mt-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">
             <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sab</span><span className="text-emerald-500">Dom</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliatesReports;
