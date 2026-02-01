
import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { Product, SEOMetadata } from '../types';

const SEOOnPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SEOMetadata>({ title: '', description: '', keywords: '', slug: '' });

  useEffect(() => {
    // Fix: Await products
    const load = async () => {
      const data = await storeService.getProducts();
      setProducts(data);
    };
    load();
  }, []);

  const handleSelect = (p: Product) => {
    setSelectedId(p.id);
    setFormData(p.seo || { title: p.name, description: p.description, keywords: '', slug: p.name.toLowerCase().replace(/ /g, '-') });
  };

  const handleSave = async () => {
    if (!selectedId) return;
    const p = products.find(x => x.id === selectedId);
    if (p) {
      const updatedProduct = { ...p, seo: formData };
      // Fix: Await save and reload
      await storeService.saveProduct(updatedProduct);
      const data = await storeService.getProducts();
      setProducts(data);
      alert('Metadados SEO salvos no backend!');
    }
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="bg-slate-900 rounded-[50px] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]"></div>
        <h2 className="text-3xl font-black mb-4 tracking-tight">Otimização On-Page</h2>
        <p className="text-slate-400 font-medium max-w-2xl">Gerencie como seus produtos aparecem no Google e outros motores de busca.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Inventário Ativo</p>
          <div className="max-h-[600px] overflow-y-auto custom-scrollbar space-y-2">
            {products.map(p => (
              <button 
                key={p.id}
                onClick={() => handleSelect(p)}
                className={`w-full p-6 rounded-[32px] border text-left transition-all ${
                  selectedId === p.id ? 'bg-emerald-500 text-white border-emerald-500 shadow-xl' : 'bg-white border-slate-100 hover:border-emerald-500'
                }`}
              >
                <p className="text-xs font-black truncate">{p.name}</p>
                <p className={`text-[10px] font-bold mt-1 ${selectedId === p.id ? 'text-emerald-100' : 'text-slate-400'}`}>Slug: /{p.seo?.slug || 'nao-configurado'}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8">
          {selectedId ? (
            <div className="bg-white rounded-[50px] border border-slate-100 shadow-xl p-10 space-y-8 animate-in slide-in-from-right-10">
               <h3 className="text-xl font-black text-slate-900 border-b border-slate-50 pb-6">Configuração do Produto</h3>
               <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Meta Title (Máx 60 car.)</label>
                    <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 outline-none font-bold text-slate-800" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Meta Description (Máx 160 car.)</label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 outline-none font-bold text-slate-800 h-24" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Slug Amigável</label>
                      <input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 outline-none font-bold text-slate-800" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Keywords</label>
                      <input value={formData.keywords} onChange={e => setFormData({...formData, keywords: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 outline-none font-bold text-slate-800" />
                    </div>
                  </div>
               </div>
               <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                  <div className="bg-emerald-50 px-4 py-2 rounded-xl">
                    <p className="text-[10px] font-black text-emerald-600 uppercase">Preview Google</p>
                    <p className="text-blue-600 font-bold truncate max-w-[300px]">{formData.title}</p>
                    <p className="text-emerald-700 text-[10px]">gfitlife.com/{formData.slug}</p>
                  </div>
                  <button onClick={handleSave} className="px-10 py-5 bg-slate-900 text-white rounded-3xl font-black hover:bg-emerald-500 shadow-xl transition-all">SALVAR METADADOS</button>
               </div>
            </div>
          ) : (
            <div className="h-[600px] bg-slate-50 rounded-[60px] border-4 border-dashed border-white flex flex-col items-center justify-center text-center p-20 opacity-60">
               <div className="text-6xl mb-8">🔍</div>
               <h3 className="text-xl font-black text-slate-900 mb-2">Editor de Metadados</h3>
               <p className="text-slate-500 font-medium max-w-sm">Selecione um produto da lista lateral para ajustar seus parâmetros de busca orgânica.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SEOOnPage;
