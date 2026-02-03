import React, { useState, useEffect } from 'react';
import { Commission, Affiliate } from '../types';
import { storeService } from '../services/storeService';

const AffiliatesCommissions: React.FC = () => {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    const data = await storeService.getCommissions();
    // Ordenar por data mais recente
    setCommissions([...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCommissions = commissions.filter(c => {
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchDate = !filterDate || c.createdAt.startsWith(filterDate);
    return matchStatus && matchDate;
  });

  const totalCommissions = filteredCommissions.reduce((acc, c) => acc + c.amount, 0);

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Auditoria de Comissões</h2>
          <p className="text-slate-500 font-medium">Controle granular de bonificações geradas pelo ecossistema.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
           <div className="space-y-1">
             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Filtrar Status</label>
             <select 
               value={filterStatus}
               onChange={(e) => setFilterStatus(e.target.value)}
               className="bg-white border border-slate-200 rounded-2xl px-6 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
             >
               <option value="all">TODOS OS STATUS</option>
               <option value="pending">PENDENTE</option>
               <option value="paid">PAGO</option>
               <option value="canceled">CANCELADO</option>
             </select>
           </div>
           <div className="space-y-1">
             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Data de Geração</label>
             <input 
               type="date"
               value={filterDate}
               onChange={(e) => setFilterDate(e.target.value)}
               className="bg-white border border-slate-200 rounded-2xl px-6 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
             />
           </div>
           <div className="px-8 py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex flex-col justify-center">
             <span className="text-emerald-100 opacity-70">Total Filtrado:</span>
             <span className="text-lg">R$ {totalCommissions.toFixed(2)}</span>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[50px] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-80 space-y-4">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando com Supabase...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Comissão</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Afiliado</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Origem (Pedido)</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCommissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-32 text-center">
                      <div className="text-5xl mb-6 grayscale opacity-20">📊</div>
                      <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Nenhum registro encontrado para estes filtros.</p>
                    </td>
                  </tr>
                ) : (
                  filteredCommissions.map(comm => (
                    <tr key={comm.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-8 py-6">
                        <p className="font-mono text-[10px] text-slate-400 uppercase font-black">#{comm.id.split('-')[1] || comm.id.slice(-6)}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-black text-slate-800 text-sm group-hover:text-emerald-600 transition-colors">
                          {comm.affiliate?.name || `Afiliado ${comm.affiliateId.slice(-4)}`}
                        </p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                           <span className="text-slate-300">🛒</span>
                           <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">ORD-{comm.orderId.split('-')[1] || comm.orderId.slice(-6)}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-black text-emerald-600 text-sm">R$ {comm.amount.toFixed(2)}</p>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          comm.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                          comm.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                          'bg-red-50 text-red-600 border-red-100'
                        }`}>
                          {comm.status === 'pending' ? 'Pendente' : 
                           comm.status === 'paid' ? 'Pago' : 'Cancelado'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right font-bold text-slate-400 text-[10px]">
                        {new Date(comm.createdAt).toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AffiliatesCommissions;