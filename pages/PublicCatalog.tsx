import React, { useState, useEffect } from 'react';
import { Product, UserSession } from '../types';
import { storeService } from '../services/storeService';
import { MOCK_PRODUCTS } from '../constants';
import ProductCard from '../components/ProductCard';

interface PublicCatalogProps {
  onBuy: (product: Product) => void;
  showOnlyOffers?: boolean;
}

const PublicCatalog: React.FC<PublicCatalogProps> = ({ onBuy, showOnlyOffers }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
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
              user={session}
            />
          ))}
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