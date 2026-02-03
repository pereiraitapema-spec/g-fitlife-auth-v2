import React, { useState, useEffect } from 'react';
import { Product, UserSession } from '../types';
import { storeService } from '../services/storeService';

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  user?: UserSession | null;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, user }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);

  useEffect(() => {
    if (user) {
      storeService.isProductFavorited(user.userId, product.id).then(setIsFavorited);
    }
  }, [user, product.id]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      alert("Por favor, faça login para salvar seus produtos favoritos!");
      return;
    }
    
    setLoadingFav(true);
    const added = await storeService.toggleFavorite(user.userId, product.id);
    setIsFavorited(added);
    setLoadingFav(false);
  };

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-slate-100 transition-all hover:shadow-2xl hover:shadow-emerald-100 flex flex-col h-full relative">
      {/* Favorite Button */}
      <button 
        onClick={handleToggleFavorite}
        disabled={loadingFav}
        className={`absolute top-4 left-4 z-20 w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all active:scale-90 ${
          isFavorited ? 'bg-emerald-500 text-white' : 'bg-white/90 backdrop-blur-sm text-slate-400 hover:text-emerald-500'
        }`}
      >
        {loadingFav ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {product.originalPrice && (
          <div className="absolute bottom-4 left-4 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
            Oferta
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm text-xs font-bold flex items-center gap-1">
          <span className="text-amber-400">★</span> {product.rating}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{product.brand}</p>
        <h3 className="font-bold text-slate-800 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-tight mb-2">
          {product.name}
        </h3>
        
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl font-black text-slate-900">
            R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-slate-400 line-through">
              R$ {product.originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          )}
        </div>

        <div className="mt-auto">
          <button 
            onClick={() => onAddToCart(product)}
            className="w-full py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-200 transition-all flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            ADICIONAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;