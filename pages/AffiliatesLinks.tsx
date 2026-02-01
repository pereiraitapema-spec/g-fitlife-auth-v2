
import React, { useState, useEffect } from 'react';
import { Affiliate, Product } from '../types';
import { storeService } from '../services/storeService';

const AffiliatesLinks: React.FC = () => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedAff, setSelectedAff] = useState<string>('');

  useEffect(() => {
    // Fix: Await async methods
    const load = async () => {
      const aData = await storeService.getAffiliates();
      const pData = await storeService.getProducts();
      setAffiliates(aData);
      setProducts(pData);
    };
    load();
  }, []);

  const currentAff = affiliates.find(a => a.id === selectedAff);

  return (
    <div className="animate-in fade-in duration-700 space-y-8">
      <div className="bg-slate-900 rounded-[50px] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[120px] -mr-32 -mt-32"></div>
        <div className="max-w-xl relative">
          <h2 className="text-3xl font-black mb-4 tracking-tight">Gerador de Links Refs</h2>
          <p className="text-slate-400 font-medium mb-10">Selecione um parceiro para visualizar seus links de rastreamento únicos por produto.</p>
          
          <select 
            value={selectedAff}
            onChange={e => setSelectedAff(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-[24px] px-8 py-5 text-lg font-black outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          >
            <option value="" className="text-slate-900">Selecione um Afiliado...</option>
            {affiliates.map(a => (
              <option key={a.id} value={a.id} className="text-slate-900">{a.name} ({a.refCode})</option>
            ))}
          </select>
        </div>
      </div>

      {currentAff ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {products.map(p => (
            <div key={p.id} className="bg-white rounded-[40px] border border-slate-100 p-8 flex items-center gap-6 shadow-sm hover:shadow-xl transition-all">
              <img src={p.image} className="w-20 h-20 rounded-3xl object-cover shadow-lg" alt="" />
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{p.brand}</p>
                <h4 className="font-black text-slate-800 text-sm mb-3">{p.name}</h4>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <code className="text-[10px] font-bold text-emerald-600 truncate flex-1">
                    gfitlife.shop/p/{p.id}?ref={currentAff.refCode}
                  </code>
                  <button className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase">Copiar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-32 text-center bg-white rounded-[60px] border-2 border-dashed border-slate-100 grayscale opacity-40">
          <div className="text-6xl mb-6">🔗</div>
          <p className="font-black uppercase tracking-[0.3em] text-sm">Aguardando seleção de parceiro</p>
        </div>
      )}
    </div>
  );
};

export default AffiliatesLinks;
