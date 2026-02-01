
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-slate-100 transition-all hover:shadow-2xl hover:shadow-emerald-100 flex flex-col h-full">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {product.originalPrice && (
          <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
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
