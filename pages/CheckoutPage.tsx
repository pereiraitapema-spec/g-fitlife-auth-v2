
import React, { useState } from 'react';
import { Product, Order, OrderStatus } from '../types';
import { storeService } from '../services/storeService';

interface CheckoutPageProps {
  product: Product | null;
  onComplete: () => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ product, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState({ name: '', email: '', zip: '', address: '' });

  if (!product) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-6 animate-in fade-in">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-4xl">🛒</div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-slate-800">Seu carrinho está aguardando</h3>
          <p className="text-slate-400 font-medium">Volte para a vitrine e selecione um produto para iniciar sua compra.</p>
        </div>
      </div>
    );
  }

  const handlePay = () => {
    setLoading(true);
    // Simulação de processamento de checkout (Studio System Interaction)
    setTimeout(() => {
      const order: Order = {
        id: 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        customerName: customer.name,
        customerEmail: customer.email,
        items: [{ ...product, quantity: 1 }],
        total: product.price,
        discount: 0,
        finalTotal: product.price,
        status: OrderStatus.PAID,
        createdAt: new Date().toISOString()
      };
      
      // PERSISTÊNCIA NO SISTEMA DO STUDIO
      storeService.saveOrder(order);
      setLoading(false);
      setStep(3);
    }, 2500);
  };

  return (
    <div className="animate-in slide-in-from-bottom-8 duration-700 max-w-5xl mx-auto py-12">
      <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8 px-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Checkout Seguro</h2>
        <div className="flex items-center gap-6">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-6">
              <div className={`w-12 h-12 rounded-[20px] flex items-center justify-center font-black text-lg transition-all duration-500 ${
                step === s ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/30' : 
                step > s ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400'
              }`}>
                {step > s ? '✓' : s}
              </div>
              {s < 3 && <div className={`w-16 h-1 bg-slate-200 rounded-full`}>
                <div className={`h-full bg-slate-900 transition-all duration-700 ${step > s ? 'w-full' : 'w-0'}`}></div>
              </div>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Painel de Formulários */}
        <div className="lg:col-span-8">
          {step === 1 && (
            <div className="bg-white p-12 rounded-[50px] border border-slate-100 shadow-xl space-y-10 animate-in fade-in slide-in-from-left-4">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">1. Dados de Envio</h3>
                <p className="text-slate-400 font-medium">Preencha onde enviaremos seus produtos.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome Completo</label>
                  <input required placeholder="Como no seu documento..." value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-3xl p-6 outline-none font-bold transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">E-mail de Contato</label>
                  <input required type="email" placeholder="seu@email.com" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-3xl p-6 outline-none font-bold transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">CEP</label>
                  <input placeholder="00000-000" value={customer.zip} onChange={e => setCustomer({...customer, zip: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-3xl p-6 outline-none font-bold transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Endereço</label>
                  <input placeholder="Rua, número, complemento..." value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-3xl p-6 outline-none font-bold transition-all" />
                </div>
              </div>
              <button 
                onClick={() => setStep(2)}
                disabled={!customer.name || !customer.email}
                className="w-full py-6 bg-slate-900 text-white rounded-[28px] font-black text-lg hover:bg-emerald-500 transition-all duration-300 disabled:opacity-30 active:scale-[0.98]"
              >
                PROSSEGUIR PARA PAGAMENTO
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white p-12 rounded-[50px] border border-slate-100 shadow-xl space-y-10 animate-in fade-in slide-in-from-left-4">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">2. Método de Pagamento</h3>
                <p className="text-slate-400 font-medium">Pagamento processado de forma segura.</p>
              </div>
              <div className="space-y-4">
                <div className="p-8 bg-emerald-50 rounded-[36px] border-2 border-emerald-500 flex items-center gap-6 group">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-emerald-100 transition-transform group-hover:scale-110">💳</div>
                  <div className="flex-1">
                    <p className="font-black text-emerald-900 text-xl tracking-tight">Cartão de Crédito</p>
                    <p className="text-sm text-emerald-600 font-bold uppercase tracking-widest">Aprovação Imediata</p>
                  </div>
                  <div className="w-8 h-8 rounded-full border-[6px] border-emerald-500 bg-white"></div>
                </div>
                <div className="p-8 bg-slate-50 rounded-[36px] border-2 border-transparent flex items-center gap-6 opacity-40 cursor-not-allowed grayscale">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl">📱</div>
                  <div className="flex-1">
                    <p className="font-black text-slate-800 text-xl tracking-tight">PIX (Indisponível)</p>
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Aguardando Liberação</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={handlePay}
                disabled={loading}
                className="w-full py-6 bg-emerald-500 text-white rounded-[28px] font-black text-lg shadow-2xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all duration-300 flex items-center justify-center gap-4 active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <span className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></span>
                    PROCESSANDO PAGAMENTO...
                  </>
                ) : (
                  'CONFIRMAR PAGAMENTO AGORA'
                )}
              </button>
              <button onClick={() => setStep(1)} className="w-full text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-900 transition-colors">Voltar para dados de envio</button>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white p-16 rounded-[60px] border border-slate-100 shadow-2xl text-center space-y-8 animate-in zoom-in-95">
              <div className="w-32 h-32 bg-emerald-500 text-white rounded-[40px] flex items-center justify-center text-6xl mx-auto shadow-2xl shadow-emerald-500/20">🚀</div>
              <div className="space-y-4">
                <h3 className="text-4xl font-black text-slate-900 tracking-tight">Pedido Realizado!</h3>
                <p className="text-slate-500 text-lg font-medium max-w-sm mx-auto">Sua jornada rumo à performance máxima começou. O pedido de <strong>{product.name}</strong> foi registrado no sistema.</p>
              </div>
              <button 
                onClick={onComplete}
                className="w-full py-6 bg-slate-900 text-white rounded-[28px] font-black text-lg shadow-xl hover:bg-emerald-500 transition-all duration-300"
              >
                IR PARA MEUS PEDIDOS
              </button>
            </div>
          )}
        </div>

        {/* Resumo Lateral */}
        <div className="lg:col-span-4">
          <div className="bg-slate-900 rounded-[50px] p-10 text-white sticky top-12 shadow-2xl space-y-10 overflow-hidden">
             <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[100px] -mr-24 -mt-24"></div>
             <div className="relative">
               <h4 className="text-2xl font-black mb-8 border-b border-white/10 pb-6 tracking-tight">Resumo do Pedido</h4>
               <div className="flex gap-6 items-start mb-10">
                 <img src={product.image} className="w-24 h-24 rounded-[30px] object-cover shadow-2xl border-2 border-white/5" alt={product.name} />
                 <div className="flex-1 space-y-1">
                   <p className="font-black text-lg leading-tight line-clamp-2">{product.name}</p>
                   <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">{product.brand || 'G-FitLife'}</p>
                 </div>
               </div>
               
               <div className="space-y-6 pt-10 border-t border-white/10">
                 <div className="flex justify-between text-slate-400 font-bold text-sm">
                   <span>Subtotal Líquido</span>
                   <span>R$ {product.price.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-slate-400 font-bold text-sm">
                   <span>Frete Prioritário</span>
                   <span className="text-emerald-400 uppercase font-black text-[10px] tracking-widest bg-emerald-500/10 px-2 py-1 rounded">CORTESIA</span>
                 </div>
                 <div className="flex justify-between text-3xl font-black pt-8 border-t border-white/20 mt-4">
                   <span>Total</span>
                   <span className="text-emerald-400 tracking-tighter">R$ {product.price.toFixed(2)}</span>
                 </div>
               </div>

               <div className="bg-white/5 rounded-[30px] p-6 mt-12 border border-white/10">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Auditado pelo Studio</p>
                 <div className="flex items-center gap-3">
                   <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                   <p className="text-xs font-bold text-slate-300">Transação Segura (AES-256)</p>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
