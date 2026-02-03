import React, { useState, useEffect } from 'react';
import { UserSession, Order, Product } from '../types';
import { storeService } from '../services/storeService';

interface CustomerPortalProps {
  user: UserSession | null;
  onNavigate: (route: any) => void;
}

const CustomerPortal: React.FC<CustomerPortalProps> = ({ user, onNavigate }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (user) {
        const allOrders = await storeService.getOrders();
        setOrders(allOrders.filter(o => o.customerEmail.toLowerCase() === user.userEmail.toLowerCase()));
        
        const favs = await storeService.getFavorites(user.userId);
        setFavorites(favs);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  if (!user) return <div className="p-20 text-center">Por favor, faça login.</div>;

  return (
    <div className="animate-in fade-in duration-700 space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-slate-100 pb-10">
         <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-slate-900 rounded-[30px] flex items-center justify-center text-white text-3xl font-black shadow-xl">
               {user.userName.charAt(0)}
            </div>
            <div>
               <h2 className="text-4xl font-black text-slate-900 tracking-tight">Meu Perfil</h2>
               <p className="text-slate-500 font-medium">{user.userEmail}</p>
            </div>
         </div>
         <div className="flex gap-4">
            <button onClick={() => onNavigate('favorites')} className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-600 hover:border-emerald-500 transition-all">Meus Favoritos ({favorites.length})</button>
            <button onClick={() => storeService.logout()} className="px-6 py-3 bg-red-50 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Sair</button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
         {/* Histórico de Pedidos */}
         <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
               <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Histórico de Compras</h3>
               <span className="px-4 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">{orders.length} pedidos</span>
            </div>

            {orders.length === 0 ? (
               <div className="p-20 text-center bg-slate-50 rounded-[50px] border-4 border-dashed border-white grayscale opacity-50">
                  <div className="text-6xl mb-6">🛒</div>
                  <p className="font-black uppercase tracking-widest text-xs">Nenhum pedido realizado ainda.</p>
                  <button onClick={() => onNavigate('store-catalog')} className="mt-8 px-10 py-4 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase">Começar a Comprar</button>
               </div>
            ) : (
               <div className="space-y-4">
                  {orders.map(order => (
                     <div key={order.id} className="bg-white rounded-[40px] border border-slate-100 p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm hover:shadow-xl transition-all group">
                        <div className="flex items-center gap-6">
                           <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl group-hover:rotate-6 transition-transform">📦</div>
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Pedido #{order.id.split('-')[1] || order.id.slice(-6)}</p>
                              <h4 className="font-black text-slate-800">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</h4>
                           </div>
                        </div>
                        <div className="text-center">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Valor Total</p>
                           <p className="font-black text-emerald-600 text-xl">R$ {order.finalTotal.toFixed(2)}</p>
                        </div>
                        <div>
                           <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              order.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                           }`}>
                              {order.status === 'paid' ? '● Pago' : '● Pendente'}
                           </span>
                        </div>
                        <button className="px-6 py-3 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase hover:bg-slate-900 hover:text-white transition-all">Ver Detalhes</button>
                     </div>
                  ))}
               </div>
            )}
         </div>

         {/* Resumo de Atividade */}
         <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 rounded-[50px] p-10 text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:scale-150 transition-all"></div>
               <h4 className="text-xl font-black mb-8 border-b border-white/10 pb-4">Status da Jornada</h4>
               <div className="space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-lg">💎</div>
                     <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase">Pontos G-Fit</p>
                        <p className="font-black">1.240 pts</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-lg">⚡</div>
                     <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase">Nível de Membro</p>
                        <p className="font-black">Elite Performance</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-[50px] p-8 border border-slate-100 shadow-xl space-y-6">
               <h4 className="text-lg font-black text-slate-900 border-b border-slate-50 pb-4">Suporte Personalizado</h4>
               <p className="text-sm text-slate-500 font-medium leading-relaxed">Precisa de ajuda com algum pedido ou dúvida sobre suplementação?</p>
               <button onClick={() => onNavigate('public-contact')} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all">Falar com Especialista</button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default CustomerPortal;