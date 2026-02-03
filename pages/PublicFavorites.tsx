import React, { useState, useEffect } from 'react';
import { Product, UserSession } from '../types';
import { storeService } from '../services/storeService';
import ProductCard from '../components/ProductCard';

interface PublicFavoritesProps {
  user: UserSession | null;
  onAddToCart: (p: Product) => void;
  onNavigate: (route: any) => void;
}

const PublicFavorites: React.FC<PublicFavoritesProps> = ({ user, onAddToCart, onNavigate }) => {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavs = async () => {
      if (user) {
        const data = await storeService.getFavorites(user.userId);
        setFavorites(data);
      }
      setLoading(false);
    };
    loadFavs();
  }, [user]);

  if (!user) {
    return (
      <div className="py-32 text-center space-y-8 animate-in fade-in">
        <div className="text-7xl">🔒</div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Acesso Restrito</h2>
        <p className="text-slate-500 font-medium max-w-sm mx-auto">Faça login para salvar e visualizar seus produtos favoritos.</p>
        <button onClick={() => onNavigate('public-home')} className="px-10 py-5 bg-slate-900 text-white rounded-[30px] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-emerald-500 transition-all">VOLTAR PARA A LOJA</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-40 flex flex-col items-center justify-center space-y-6">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Buscando sua lista de desejos...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 space-y-12 py-10">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-100 pb-12">
        <div className="space-y-3">
          <div className="inline-block px-4 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">Lista de Desejos</div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none">Meus <span className="text-emerald-500">Favoritos</span></h2>
          <p className="text-slate-500 text-lg font-medium">Os produtos que você selecionou para alcançar sua melhor versão.</p>
        </div>
        <button onClick={() => onNavigate('store-catalog')} className="px-8 py-4 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all">ADICIONAR MAIS ITENS</button>
      </div>

      {favorites.length === 0 ? (
        <div className="py-32 text-center bg-slate-50 rounded-[60px] border-4 border-dashed border-white space-y-8 grayscale opacity-50">
          <div className="text-7xl">💔</div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900">Sua lista está vazia</h3>
            <p className="text-slate-500 font-medium max-w-xs mx-auto">Explore nosso catálogo e clique no coração para salvar produtos aqui.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {favorites.map(p => (
            <ProductCard 
              key={p.id} 
              product={p} 
              onAddToCart={onAddToCart} 
              user={user} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicFavorites;