
import React, { useState, useEffect } from 'react';
import { Commission } from '../types';
import { storeService } from '../services/storeService';

const AffiliatesCommissions: React.FC = () => {
  const [commissions, setCommissions] = useState<Commission[]>([]);

  /* Fix: updated to await getCommissions */
  useEffect(() => {
    const load = async () => {
      const data = await storeService.getCommissions();
      setCommissions(data);
    };
    load();
  }, []);

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Fluxo Financeiro</h2>
          <p className="text-slate-500 font-medium">Controle de pagamentos e bonificações para parceiros.</p>
        </div>
        <div className="px-6 py-3 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">
          Total Pago: R$ 0,00
        </div>
      </div>

      <div className="bg-white rounded-[50px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Comissão</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Afiliado</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Origem (Pedido)</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {commissions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                  Nenhuma comissão gerada no sistema ainda.
                </td>
              </tr>
            ) : (
              commissions.map(comm => (
                <tr key={comm.id} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <p className="font-black text-slate-900 text-sm tracking-tighter">#{comm.id.split('-')[1]}</p>
                    <p className="text-[10px] text-slate-400">{new Date(comm.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-bold text-slate-800 text-sm">Afiliado #{comm.affiliateId.slice(-4)}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-bold text-slate-500">#{comm.orderId.split('-')[1]}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-black text-emerald-600">R$ {comm.amount.toFixed(2)}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      comm.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      {comm.status === 'pending' ? 'Pendente' : 'Liquidado'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AffiliatesCommissions;
