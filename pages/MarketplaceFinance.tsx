
import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { Seller, Order } from '../types';

const MarketplaceFinance: React.FC = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Fix: Await async data
    const load = async () => {
      const sData = await storeService.getSellers();
      const oData = await storeService.getOrders();
      setSellers(sData);
      setOrders(oData);
    };
    load();
  }, []);

  const calculateSellerBalance = (sellerId: string) => {
    const sellerOrders = orders.filter(o => o.items.some(i => i.sellerId === sellerId));
    const sellerSales = sellerOrders.reduce((acc, o) => {
      const sellerItems = o.items.filter(i => i.sellerId === sellerId);
      return acc + sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }, 0);
    
    const seller = sellers.find(s => s.id === sellerId);
    const commission = sellerSales * ((seller?.commissionRate || 0) / 100);
    const balance = sellerSales - commission;

    return { sales: sellerSales, commission, balance };
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Financeiro Marketplace</h2>
          <p className="text-slate-500 font-medium">Controle de faturamento, comissões de plataforma e repasses aos lojistas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sellers.map(sel => {
          const stats = calculateSellerBalance(sel.id);
          return (
            <div key={sel.id} className="bg-white rounded-[50px] border border-slate-100 p-10 shadow-sm hover:shadow-2xl transition-all relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-6 text-[9px] font-black text-emerald-500 bg-emerald-50 rounded-bl-3xl">Split Prep</div>
               <h3 className="text-xl font-black text-slate-900 mb-8 border-b border-slate-50 pb-4">{sel.name}</h3>
               
               <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <span>Venda Bruta</span>
                    <span className="text-slate-800">R$ {stats.sales.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-amber-500 uppercase tracking-widest">
                    <span>Taxa G-FitLife ({sel.commissionRate}%)</span>
                    <span>- R$ {stats.commission.toFixed(2)}</span>
                  </div>
                  <div className="pt-4 border-t border-slate-50 flex justify-between text-xl font-black text-emerald-600">
                    <span>Líquido Repasse</span>
                    <span>R$ {stats.balance.toFixed(2)}</span>
                  </div>
               </div>

               <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all">EXECUTAR REPASSE (SIM)</button>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-900 rounded-[60px] p-12 text-white shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
         <h3 className="text-2xl font-black mb-4">Mecanismo de Split Automatizado</h3>
         <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            O sistema está configurado para calcular as comissões de marketplace em tempo real. No Módulo 11 (Financeiro Avançado), integraremos o split automático diretamente via Gateway de Pagamento, eliminando a necessidade de repasses manuais.
         </p>
      </div>
    </div>
  );
};

export default MarketplaceFinance;
