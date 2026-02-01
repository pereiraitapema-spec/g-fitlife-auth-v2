
import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { Transaction } from '../types';

const FinanceTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // Adicionado await para carregar transações e aplicar reverse()
    const load = async () => {
      setTransactions((await storeService.getTransactions()).reverse());
    };
    load();
  }, []);

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Histórico de Transações</h2>
          <p className="text-slate-500 font-medium">Auditoria completa de todas as entradas do sistema.</p>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Transação</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pedido</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Método</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {transactions.length === 0 && (
               <tr>
                 <td colSpan={5} className="px-8 py-20 text-center text-slate-300 font-black text-xs uppercase tracking-widest">Aguardando transações reais no Studio Backend...</td>
               </tr>
            )}
            {transactions.map(t => (
              <tr key={t.id} className="hover:bg-slate-50 transition-all">
                <td className="px-8 py-6 font-mono text-[10px] text-slate-400 uppercase">{t.id}</td>
                <td className="px-8 py-6 font-black text-slate-800 text-sm">#{t.orderId.slice(-6).toUpperCase()}</td>
                <td className="px-8 py-6">
                  <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                    {t.method.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-8 py-6 font-black text-slate-900">R$ {t.amount.toFixed(2)}</td>
                <td className="px-8 py-6">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    t.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {t.status === 'paid' ? 'Liquidado' : 'Processando'}
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

export default FinanceTransactions;
