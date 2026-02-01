
import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import { storeService } from '../services/storeService';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  /* Fixed: storeService.getOrders is asynchronous and needs await */
  const loadOrders = async () => {
    const data = await storeService.getOrders();
    setOrders([...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  /* Fixed: updateStatus needs to await for the state to be consistent */
  const updateStatus = async (id: string, newStatus: OrderStatus) => {
    await storeService.updateOrderStatus(id, newStatus);
    await loadOrders();
    if (selectedOrder?.id === id) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return { label: 'Pendente', class: 'bg-amber-100 text-amber-600', icon: '⏳' };
      case OrderStatus.PAID: return { label: 'Aprovado', class: 'bg-emerald-100 text-emerald-600', icon: '💎' };
      case OrderStatus.SHIPPED: return { label: 'Despachado', class: 'bg-blue-100 text-blue-600', icon: '📦' };
      case OrderStatus.DELIVERED: return { label: 'Entregue', class: 'bg-purple-100 text-purple-600', icon: '🏠' };
      case OrderStatus.CANCELED: return { label: 'Estornado', class: 'bg-red-100 text-red-600', icon: '✕' };
      default: return { label: 'Status', class: 'bg-slate-100 text-slate-600', icon: '•' };
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-3">Rastreamento Logístico</h2>
          <p className="text-slate-500 font-medium">Histórico de vendas consolidado no Sistema do Studio.</p>
        </div>
        <div className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          Studio Backend Link: Online
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        {/* Painel Esquerdo: Listagem */}
        <div className="xl:col-span-7 space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-[60px] border-2 border-dashed border-slate-100 p-32 text-center shadow-inner flex flex-col items-center">
              <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center text-5xl mb-8 opacity-40">📊</div>
              <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs">Sem vendas registradas no sistema.</p>
            </div>
          ) : (
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocolo</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Comprador</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fluxo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {orders.map(order => {
                      const info = getStatusInfo(order.status);
                      return (
                        <tr 
                          key={order.id} 
                          onClick={() => setSelectedOrder(order)}
                          className={`cursor-pointer group transition-all duration-300 ${selectedOrder?.id === order.id ? 'bg-emerald-50/70 border-l-4 border-l-emerald-500' : 'hover:bg-slate-50'}`}
                        >
                          <td className="px-8 py-7">
                            <p className="font-black text-slate-900 text-sm tracking-tight group-hover:translate-x-1 transition-transform">#{order.id.split('-')[1] || order.id.slice(-6)}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
                          </td>
                          <td className="px-8 py-7">
                            <p className="font-bold text-slate-800 text-sm line-clamp-1">{order.customerName}</p>
                            <p className="text-[10px] text-slate-400 lowercase truncate max-w-[120px]">{order.customerEmail}</p>
                          </td>
                          <td className="px-8 py-7 font-black text-slate-900 text-sm tracking-tighter">
                            R$ {order.finalTotal.toFixed(2)}
                          </td>
                          <td className="px-8 py-7">
                            <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit ${info.class} shadow-sm border border-white/10`}>
                              <span className="scale-125">{info.icon}</span>
                              {info.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Painel Direito: Console de Gestão */}
        <div className="xl:col-span-5">
          {selectedOrder ? (
            <div className="bg-white rounded-[60px] border border-slate-100 shadow-2xl p-12 sticky top-10 animate-in slide-in-from-right-10 duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl -mr-24 -mt-24"></div>
              
              <div className="flex justify-between items-start mb-12 relative">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Console de Pedido</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">UID: {selectedOrder.id}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="w-12 h-12 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all active:scale-90 font-bold">✕</button>
              </div>

              <div className="space-y-10 relative">
                {/* Visualização de Itens Adquiridos */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">Carrinho de Origem</p>
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-50 p-6 rounded-[32px] group hover:bg-white hover:shadow-xl transition-all border-2 border-transparent hover:border-emerald-100">
                      <div className="flex items-center gap-5">
                        <img src={item.image} className="w-16 h-16 rounded-[24px] object-cover shadow-2xl" alt={item.name} />
                        <div>
                          <p className="text-sm font-black text-slate-900 line-clamp-1">{item.name}</p>
                          <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded mt-1 inline-block">QTD: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-sm font-black text-slate-900 tracking-tighter">R$ {(item.quantity * item.price).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                {/* Resumo Consolidado */}
                <div className="bg-slate-900 rounded-[40px] p-10 text-white space-y-5 shadow-2xl relative overflow-hidden group">
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mb-16 -mr-16 transition-all group-hover:scale-150"></div>
                  <div className="flex justify-between text-xs font-bold text-slate-400">
                    <span>Subtotal</span>
                    <span>R$ {selectedOrder.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-emerald-400">
                    <span>Bonificações</span>
                    <span>- R$ {selectedOrder.discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-3xl font-black pt-6 border-t border-white/10 mt-2">
                    <span className="tracking-tight">Total</span>
                    <span className="text-emerald-400 tracking-tighter">R$ {selectedOrder.finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Fluxo Logístico Editável */}
                <div className="space-y-4 pt-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">Estado Logístico (Studio DB Sync)</p>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { s: OrderStatus.PAID, l: 'Aprovar Pagamento', c: 'hover:bg-emerald-500' },
                      { s: OrderStatus.SHIPPED, l: 'Enviar Produto', c: 'hover:bg-blue-500' },
                      { s: OrderStatus.DELIVERED, l: 'Confirmar Entrega', c: 'hover:bg-purple-500' },
                      { s: OrderStatus.CANCELED, l: 'Cancelar & Estornar', c: 'hover:bg-red-500 border-red-100 text-red-500 hover:text-white' },
                    ].map(btn => (
                      <button 
                        key={btn.s}
                        disabled={selectedOrder.status === btn.s}
                        onClick={() => updateStatus(selectedOrder.id, btn.s)}
                        className={`group w-full py-6 px-8 rounded-[30px] text-xs font-black border-2 border-slate-100 transition-all duration-400 flex items-center justify-between ${btn.c} hover:text-white disabled:opacity-20 disabled:cursor-not-allowed disabled:grayscale shadow-sm active:scale-95`}
                      >
                        {btn.l}
                        <span className="opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 font-bold">ACTIVATE →</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-[70px] p-16 text-center flex flex-col items-center justify-center h-[600px] border-4 border-dashed border-white shadow-inner animate-in fade-in zoom-in-95">
              <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center text-5xl shadow-xl mb-10 animate-bounce duration-[2500ms]">📊</div>
              <h4 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Análise de Transação</h4>
              <p className="text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">Selecione um pedido na listagem lateral para abrir as ferramentas de auditoria e controle logístico do Studio.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
