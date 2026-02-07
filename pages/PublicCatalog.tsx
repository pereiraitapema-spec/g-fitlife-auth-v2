
import React, { useState, useEffect } from 'react';
import { Product, UserSession, Route } from '../types';
import { storeService } from '../services/storeService';
import { MOCK_PRODUCTS } from '../constants';
import ProductCard from '../components/ProductCard';

interface PublicCatalogProps {
  onBuy: (product: Product) => void;
  onNavigate?: (route: Route, params?: any) => void;
  showOnlyOffers?: boolean;
}

const PublicCatalog: React.FC<PublicCatalogProps> = ({ onBuy, onNavigate, showOnlyOffers }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [email, setEmail] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [session, setSession] = useState<UserSession | null>(null);

  const loadData = async () => {
    const allProducts = await storeService.getProducts();
    const activeProducts = allProducts.filter(p => p.status === 'active');
    
    let finalProducts = activeProducts.length > 0 ? activeProducts : MOCK_PRODUCTS;

    if (showOnlyOffers) {
      finalProducts = finalProducts.filter(p => p.originalPrice && p.originalPrice > p.price);
    }

    setProducts(finalProducts);
    setSession(storeService.getActiveSession());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('sessionUpdated', loadData);
    return () => window.removeEventListener('sessionUpdated', loadData);
  }, [showOnlyOffers]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsCapturing(true);
  };

  const handleCaptureLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProduct && email) {
      await storeService.captureLead(email, selectedProduct);
      setIsCapturing(false);
      onBuy(selectedProduct);
    }
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className={`inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${showOnlyOffers ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
          {showOnlyOffers ? 'Promoções Imperdíveis' : 'Shopping Online'}
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          {showOnlyOffers ? 'Ofertas Relâmpago' : 'Eleve sua Performance ao nível máximo.'}
        </h2>
        <p className="text-slate-500 text-lg font-medium">
          {showOnlyOffers ? 'Descontos exclusivos validados por nossa IA para você.' : 'Produtos selecionados criteriosamente para sua saúde e bem-estar.'}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="py-20 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
           <p className="text-slate-400 font-bold uppercase tracking-widest">Nenhum produto encontrado nesta categoria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={() => handleProductClick(product)} 
              onQuickView={setQuickViewProduct}
              user={session}
            />
          ))}
        </div>
      )}

      {/* QUICK VIEW MODAL */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-[50px] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
            {/* Left: Product Image */}
            <div className="md:w-1/2 bg-slate-50 relative">
              <button 
                onClick={() => setQuickViewProduct(null)} 
                className="absolute top-6 left-6 z-20 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg text-slate-400 hover:text-slate-900 md:hidden"
              >
                ✕
              </button>
              <img src={quickViewProduct.image} className="w-full h-full object-cover aspect-square md:aspect-auto" alt={quickViewProduct.name} />
              {quickViewProduct.originalPrice && (
                <div className="absolute top-6 left-6 bg-red-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest hidden md:block">
                  OFERTA ESPECIAL
                </div>
              )}
            </div>

            {/* Right: Product Details */}
            <div className="md:w-1/2 p-8 md:p-12 space-y-8 flex flex-col justify-center relative">
              <button 
                onClick={() => setQuickViewProduct(null)} 
                className="absolute top-8 right-8 z-20 text-slate-300 hover:text-slate-900 hidden md:block"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="space-y-4">
                <p className="text-xs font-black text-emerald-500 uppercase tracking-[0.3em]">{quickViewProduct.brand}</p>
                <h3 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight group cursor-pointer hover:text-emerald-500 transition-colors" onClick={() => onNavigate && onNavigate('product-detail', { id: quickViewProduct.id })}>
                  {quickViewProduct.name}
                </h3>
                <div className="flex items-center gap-3">
                   <div className="flex text-amber-400 text-lg">★★★★★</div>
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">({quickViewProduct.reviews} avaliações)</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-black text-slate-900">R$ {quickViewProduct.price.toFixed(2)}</span>
                  {quickViewProduct.originalPrice && (
                    <span className="text-xl text-slate-400 line-through">R$ {quickViewProduct.originalPrice.toFixed(2)}</span>
                  )}
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Em até 10x sem juros no cartão</p>
              </div>

              <p className="text-slate-600 leading-relaxed font-medium">
                {quickViewProduct.description || "Este produto foi selecionado por nossos especialistas para oferecer o máximo em resultados e pureza. Ideal para atletas que buscam alta performance e saúde."}
              </p>

              <div className="pt-4 space-y-4">
                <button 
                  onClick={() => { onBuy(quickViewProduct); setQuickViewProduct(null); }}
                  className="w-full py-6 bg-slate-900 text-white rounded-[28px] font-black text-lg shadow-2xl hover:bg-emerald-500 transition-all duration-300 flex items-center justify-center gap-4 active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  ADICIONAR AO CARRINHO
                </button>
                <button 
                  onClick={() => { if(onNavigate) { onNavigate('product-detail', { id: quickViewProduct.id }); setQuickViewProduct(null); } }}
                  className="w-full py-4 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 transition-colors bg-emerald-50 rounded-2xl"
                >
                  Ver Detalhes Completos
                </button>
                <button 
                  onClick={() => setQuickViewProduct(null)}
                  className="w-full py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
                >
                  Continuar Comprando
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CAPTURA DE LEAD */}
      {isCapturing && selectedProduct && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[60px] shadow-2xl overflow-hidden p-12 animate-in zoom-in-95 text-center relative">
            <button onClick={() => setIsCapturing(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 font-bold">✕</button>
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[32px] flex items-center justify-center text-4xl mx-auto mb-8">💎</div>
            <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Oportunidade Exclusiva!</h3>
            <p className="text-slate-500 text-lg mb-10 leading-relaxed px-4">
              Deseja receber cupons e ofertas personalizadas para <strong>{selectedProduct.name}</strong>? Deixe seu e-mail para prosseguir.
            </p>
            
            <form onSubmit={handleCaptureLead} className="space-y-6">
              <input 
                required
                type="email" 
                placeholder="Seu melhor e-mail aqui..."
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-[28px] px-8 py-6 text-center font-bold text-slate-800 text-lg transition-all outline-none shadow-inner"
              />
              <button 
                type="submit"
                className="w-full py-6 bg-emerald-500 text-white rounded-[28px] font-black text-lg shadow-2xl shadow-emerald-500/20 hover:bg-emerald-600 hover:-translate-y-1 transition-all duration-300"
              >
                LIBERAR ACESSO & COMPRAR
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicCatalog;
