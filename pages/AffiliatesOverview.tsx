
import React, { useState, useEffect } from 'react';
import { Affiliate } from '../types';
import { storeService } from '../services/storeService';

const AffiliatesOverview: React.FC = () => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* Fix: updated to await getAffiliates */
  useEffect(() => {
    const load = async () => {
      const data = await storeService.getAffiliates();
      setAffiliates(data);
    };
    load();
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Rede de Parceiros</h2>
          <p className="text-slate-500 font-medium">Gerencie sua força de vendas externa e comissões.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-2xl flex items-center gap-2 hover:bg-emerald-500 transition-all"
        >
          + CADASTRAR PARCEIRO
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Parceiros Ativos', value: affiliates.length, icon: '🤝', color: 'bg-blue-500' },
          { label: 'Vendas Totais Afiliados', value: affiliates.reduce((acc, a) => acc + a.totalSales, 0), icon: '📈', color: 'bg-emerald-500' },
          { label: 'Saldo Pendente', value: `R$ ${affiliates.reduce((acc, a) => acc + a.balance, 0).toFixed(2)}`, icon: '💰', color: 'bg-amber-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className={`w-16 h-16 ${stat.color} rounded-3xl flex items-center justify-center text-3xl shadow-lg shadow-current/10`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* List Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Parceiro</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Código Ref</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Comissão (%)</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo Atual</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {affiliates.map(aff => (
              <tr key={aff.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">{aff.name.charAt(0)}</div>
                    <div>
                      <p className="font-black text-slate-800 text-sm">{aff.name}</p>
                      <p className="text-[10px] text-slate-400">{aff.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-black tracking-widest">{aff.refCode}</span>
                </td>
                <td className="px-8 py-6">
                  <p className="font-black text-slate-900">{aff.commissionRate}%</p>
                </td>
                <td className="px-8 py-6">
                  <p className="font-black text-emerald-500">R$ {aff.balance.toFixed(2)}</p>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    aff.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {aff.status === 'active' ? 'Ativo' : 'Pausado'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AffiliatesOverview;
