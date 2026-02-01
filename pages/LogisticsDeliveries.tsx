
import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { Delivery } from '../types';

const LogisticsDeliveries: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);

  useEffect(() => {
    // Adicionado await para carregar entregas e aplicar reverse()
    const load = async () => {
      setDeliveries((await storeService.getDeliveries()).reverse());
    };
    load();
  }, []);

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Monitoramento de Entregas</h2>
          <p className="text-slate-500 font-medium">Acompanhe o trajeto dos pedidos até o cliente final.</p>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tracking Code</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pedido</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Previsão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {deliveries.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center text-slate-300 font-black text-xs uppercase tracking-widest">Nenhuma entrega em trânsito.</td>
              </tr>
            )}
            {deliveries.map(d => (
              <tr key={d.id} className="hover:bg-slate-50 transition-all">
                <td className="px-8 py-7">
                  <span className="font-black text-slate-900 text-sm tracking-widest">{d.trackingCode}</span>
                </td>
                <td className="px-8 py-7 font-bold text-slate-500 text-sm">#{d.orderId.slice(-6).toUpperCase()}</td>
                <td className="px-8 py-7">
                  <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${
                    d.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {d.status === 'preparing' ? 'Processando' : d.status === 'shipped' ? 'Em Trânsito' : 'Entregue'}
                  </span>
                </td>
                <td className="px-8 py-7 text-xs font-bold text-slate-400">
                  {new Date(d.estimatedDate).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogisticsDeliveries;
