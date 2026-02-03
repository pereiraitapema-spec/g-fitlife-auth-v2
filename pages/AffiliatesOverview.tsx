import React, { useState, useEffect } from 'react';
import { Affiliate } from '../types';
import { storeService } from '../services/storeService';

const AffiliatesOverview: React.FC = () => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const data = await storeService.getAffiliates();
    setAffiliates(data);
  };

  useEffect(() => {
    load();
    window.addEventListener('usersChanged', load);
    return () => window.removeEventListener('usersChanged', load);
  }, []);

  const handleApprove = async (userId: string) => {
    setLoading(true);
    try {
      await storeService.approveAffiliate(userId);
      alert('Afiliado ativado com sucesso! O acesso e link agora estão liberados.');
      await load();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Rede de Parceiros</h2>
          <p className="text-slate-500 font-medium">Gestão de força de vendas e aprovação de novos afiliados.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Afiliados Ativos', value: affiliates.filter(a => a.status === 'active').length, icon: '🤝', color: 'bg-blue-500' },
          { label: 'Aguardando Aprovação', value: affiliates.filter(a => a.status === 'inactive').length, icon: '⏳', color: 'bg-amber-500' },
          { label: 'Saldo Pendente Total', value: `R$ ${affiliates.reduce((acc, a) => acc + a.balance, 0).toFixed(2)}`, icon: '💰', color: 'bg-emerald-500' },
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

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Parceiro</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Referência</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Comissão</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {affiliates.map(aff => (
              <tr key={aff.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">{aff.name.charAt(0)}</div>
                    <div>
                      <p className="font-black text-slate-800 text-sm">{aff.name}</p>
                      <p className="text-[10px] text-slate-400">{aff.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                  <span className={`px-3 py-1 rounded-lg text-xs font-black tracking-widest ${aff.status === 'active' ? 'bg-slate-100 text-slate-600' : 'bg-slate-50 text-slate-300'}`}>
                    {aff.status === 'active' ? aff.refCode : '---'}
                  </span>
                </td>
                <td className="px-8 py-6 text-center">
                  <p className="font-black text-slate-900">{aff.commissionRate}%</p>
                </td>
                <td className="px-8 py-6 text-center">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    aff.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {aff.status === 'active' ? 'Ativo' : 'Pendente'}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  {aff.status === 'inactive' ? (
                    <button 
                      onClick={() => handleApprove(aff.userId)}
                      disabled={loading}
                      className="px-6 py-2 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg active:scale-95"
                    >
                      LIBERAR ACESSO
                    </button>
                  ) : (
                    <button className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest">Configurar</button>
                  )}
                </td>
              </tr>
            ))}
            {affiliates.length === 0 && (
              <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-300 font-black text-xs uppercase tracking-widest">Nenhum parceiro registrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AffiliatesOverview;