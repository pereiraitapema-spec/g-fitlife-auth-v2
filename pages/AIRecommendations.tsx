
import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { AIRecommendation, Product } from '../types';

const AIRecommendations: React.FC = () => {
  const [recoms, setRecoms] = useState<AIRecommendation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  /* Fix: updated useEffect to be async */
  useEffect(() => {
    const load = async () => {
      const r = await storeService.getAIRecommendations();
      const p = await storeService.getProducts();
      setRecoms(r);
      setProducts(p);
    };
    load();
  }, []);

  const getProduct = (id: string) => products.find(p => p.id === id);

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Sugestões de Compra (IA)</h2>
          <p className="text-slate-500 font-medium">Recomendações geradas automaticamente com base no comportamento de navegação.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {recoms.map(rec => (
          <div key={rec.id} className="bg-white rounded-[50px] border border-slate-100 p-10 shadow-sm space-y-8 relative overflow-hidden group hover:border-emerald-500 transition-all">
             <div className="absolute top-0 right-0 p-8">
                <div className="px-4 py-1.5 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                   Confiança: {(rec.score * 100).toFixed(0)}%
                </div>
             </div>
             <div>
                <h3 className="text-xl font-black text-slate-900">{rec.userEmail}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Perfil do Lead</p>
             </div>
             
             <div className="p-6 bg-slate-50 rounded-3xl italic text-sm text-slate-600 border-l-4 border-emerald-500">
                "{rec.reason}"
             </div>

             <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Produtos Sugeridos</p>
                <div className="grid grid-cols-3 gap-3">
                   {rec.suggestedProductIds.map(pid => {
                      const p = getProduct(pid);
                      if (!p) return null;
                      return (
                        <div key={pid} className="space-y-2">
                           <img src={p.image} className="w-full aspect-square object-cover rounded-2xl shadow-sm" alt="" />
                           <p className="text-[9px] font-black text-slate-800 line-clamp-1 text-center uppercase tracking-tighter">{p.name}</p>
                        </div>
                      );
                   })}
                </div>
             </div>

             <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all">DISPARAR OFERTA PERSONALIZADA</button>
          </div>
        ))}

        {recoms.length === 0 && (
           <div className="col-span-full p-32 text-center bg-slate-50 rounded-[50px] border-4 border-dashed border-white flex flex-col items-center grayscale opacity-40">
              <div className="text-7xl mb-6">🧠</div>
              <p className="font-black uppercase tracking-widest text-[10px]">Aguardando dados de navegação para gerar insights.</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default AIRecommendations;
