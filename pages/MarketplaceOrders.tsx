
import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { Order, Seller } from '../types';

const MarketplaceOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<string>('all');

  /* Fixed: loadData needs to be async to await getSellers and getOrders */
  const loadData = async () => {
    const sData = await storeService.getSellers();
    setSellers(sData);
    await refreshOrders();
  };

  useEffect(() => {
    loadData();
  }, [selectedSeller]);

  /* Fixed: refreshOrders is async and needs await */
  const refreshOrders = async () => {
    const all = await storeService.getOrders();
    if (selectedSeller === 'all') {
      setOrders(all);
    } else {
      setOrders(all.filter(o => o.items.some(item => item.sellerId === selectedSeller)));
    }
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Vendas por Lojista</h2>
          <p className="text-slate-500 font-medium">Monitore o faturamento e volume de pedidos de cada vendedor.</p>
        </div>
        <select 
          value={selectedSeller} 
          onChange={e => setSelectedSeller(e.target.value)}
          className="px-6 py-4 bg-white border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm outline-none"
        >
          <option value="all">TODOS OS LOJISTAS</option>
          {sellers.map(s => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-[50px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pedido</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Itens</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Venda</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {orders.length === 0 ? (
              <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-300 font-black text-xs uppercase tracking-widest">Nenhuma venda registrada para este filtro.</td></tr>
            ) : (
              orders.map(o => (
                <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-6 font-black text-slate-800 text-sm">#{o.id.slice(-6).toUpperCase()}</td>
                  <td className="px-8 py-6 text-sm font-medium text-slate-600">{o.customerName}</td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-400">{o.items.length} itens</td>
                  <td className="px-8 py-6 font-black text-emerald-500">R$ {o.finalTotal.toFixed(2)}</td>
                  <td className="px-8 py-6 text-right">
                    <button className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest">Ver Detalhes</button>
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

export default MarketplaceOrders;
