
import React, { useState, useEffect } from 'react';
import { Product, Order, OrderStatus, Coupon, CouponType, CartItem } from '../types';

interface SaleSimulationProps {
  onOrderComplete: () => void;
}

const SaleSimulation: React.FC<SaleSimulationProps> = ({ onOrderComplete }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [customer, setCustomer] = useState({ name: '', email: '' });
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('g_fitlife_catalog_products');
    if (saved) setProducts(JSON.parse(saved).filter((p: Product) => p.status === 'active'));
  }, []);

  const addToCart = (p: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === p.id);
      if (existing) return prev.map(item => item.id === p.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...p, quantity: 1 }];
    });
  };

  const applyCoupon = () => {
    const saved = localStorage.getItem('g_fitlife_coupons');
    if (saved) {
      const coupons: Coupon[] = JSON.parse(saved);
      const coupon = coupons.find(c => c.code === couponCode && c.status === 'active');
      if (coupon) {
        setAppliedCoupon(coupon);
      } else {
        alert('Cupom inválido ou inativo.');
      }
    }
  };

  const calculateTotals = () => {
    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    let discount = 0;
    if (appliedCoupon) {
      discount = appliedCoupon.type === CouponType.PERCENTAGE 
        ? (total * appliedCoupon.value) / 100 
        : appliedCoupon.value;
    }
    return { total, discount, final: Math.max(0, total - discount) };
  };

  const { total, discount, final } = calculateTotals();

  const handleCheckout = () => {
    if (!customer.name || !customer.email || cart.length === 0) {
      alert('Preencha os dados do cliente e adicione itens ao carrinho.');
      return;
    }

    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      customerName: customer.name,
      customerEmail: customer.email,
      items: cart,
      total,
      discount,
      finalTotal: final,
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString(),
      couponCode: appliedCoupon?.code
    };

    const saved = localStorage.getItem('g_fitlife_orders');
    const orders = saved ? JSON.parse(saved) : [];
    localStorage.setItem('g_fitlife_orders', JSON.stringify([...orders, newOrder]));
    
    setIsSuccess(true);
    setTimeout(() => {
      onOrderComplete();
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 animate-in zoom-in-95">
        <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white text-5xl mb-6 shadow-xl shadow-emerald-200">✓</div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">Venda Realizada!</h2>
        <p className="text-slate-500 font-bold tracking-tight">O pedido foi registrado com sucesso no sistema.</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Simulador de Venda</h2>
          <p className="text-slate-500">Crie pedidos de teste para validar o fluxo de pedidos e cupons.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lado Esquerdo: Seleção */}
        <div className="space-y-8">
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 space-y-6">
            <h3 className="text-lg font-black text-slate-800">1. Dados do Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="text" placeholder="Nome" value={customer.name}
                onChange={e => setCustomer({...customer, name: e.target.value})}
                className="bg-slate-50 border-none rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input 
                type="email" placeholder="E-mail" value={customer.email}
                onChange={e => setCustomer({...customer, email: e.target.value})}
                className="bg-slate-50 border-none rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 space-y-6">
            <h3 className="text-lg font-black text-slate-800">2. Adicionar Itens</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {products.map(p => (
                <button 
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-transparent hover:border-emerald-500 transition-all text-left"
                >
                  <img src={p.image} className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">{p.name}</p>
                    <p className="text-sm font-black text-emerald-600">R$ {p.price.toFixed(2)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lado Direito: Carrinho e Checkout */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <h3 className="text-xl font-black">Resumo da Simulação</h3>
            
            {/* Itens do Simulado */}
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {cart.length === 0 ? (
                <p className="text-slate-500 text-sm font-bold italic">Nenhum item adicionado...</p>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-white/5 p-3 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 flex items-center justify-center bg-white/10 rounded-lg text-xs font-black">{item.quantity}x</span>
                      <p className="text-xs font-bold line-clamp-1">{item.name}</p>
                    </div>
                    <p className="text-xs font-black">R$ {(item.quantity * item.price).toFixed(2)}</p>
                  </div>
                ))
              )}
            </div>

            {/* Cupom */}
            <div className="pt-6 border-t border-white/10">
              <div className="flex gap-2">
                <input 
                  type="text" placeholder="CUPOM" value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-white/10 border-none rounded-xl px-4 py-3 text-xs font-bold tracking-widest outline-none focus:bg-white/20"
                />
                <button 
                  onClick={applyCoupon}
                  className="px-4 py-3 bg-emerald-500 text-white rounded-xl text-xs font-black"
                >
                  APLICAR
                </button>
              </div>
              {appliedCoupon && (
                <p className="text-[10px] text-emerald-400 font-bold mt-2">✓ Cupom {appliedCoupon.code} aplicado com sucesso!</p>
              )}
            </div>

            {/* Totais */}
            <div className="space-y-2 pt-6 border-t border-white/10">
              <div className="flex justify-between text-sm text-slate-400">
                <span>Subtotal</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-emerald-400">
                <span>Desconto</span>
                <span>- R$ {discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-2xl pt-4 font-black">
                <span>Total Final</span>
                <span className="text-emerald-400">R$ {final.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              className="w-full py-5 bg-white text-slate-900 rounded-[30px] font-black shadow-xl hover:bg-emerald-500 hover:text-white transition-all transform active:scale-95"
            >
              FINALIZAR VENDA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleSimulation;
