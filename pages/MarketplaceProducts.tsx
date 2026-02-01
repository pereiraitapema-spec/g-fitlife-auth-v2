
import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { Product, Seller } from '../types';

const MarketplaceProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<string>('all');

  useEffect(() => {
    // Fix: Await async data
    const load = async () => {
      const pData = await storeService.getProducts();
      const sData = await storeService.getSellers();
      setProducts(pData);
      setSellers(sData);
    };
    load();
  }, []);

  const filteredProducts = selectedSeller === 'all' 
    ? products 
    : products.filter(p => p.sellerId === selectedSeller);

  const getSellerName = (id?: string) => sellers.find(s => s.id === id)?.name || 'Próprio';

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Estoque por Lojista</h2>
          <p className="text-slate-500 font-medium">Filtre e visualize o inventário de cada parceiro.</p>
        </div>
        <div className="flex gap-4">
           <select 
            value={selectedSeller} 
            onChange={e => setSelectedSeller(e.target.value)}
            className="px-6 py-4 bg-white border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm outline-none focus:ring-2 focus:ring-emerald-500"
           >
              <option value="all">TODOS OS VENDEDORES</option>
              {sellers.map(s => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
           </select>
        </div>
      </div>

      <div className="bg-white rounded-[50px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produto</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendedor</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Preço</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredProducts.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <img src={p.image} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt="" />
                    <p className="font-black text-slate-800 text-sm">{p.name}</p>
                  </div>
                </td>
                <td className="px-8 py-6">
                   <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-600 uppercase tracking-widest">
                     {getSellerName(p.sellerId)}
                   </span>
                </td>
                <td className="px-8 py-6 text-center font-black text-slate-900">R$ {p.price.toFixed(2)}</td>
                <td className="px-8 py-6 text-center">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    p.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {p.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarketplaceProducts;
