
import React, { useState, useEffect } from 'react';
import { Product, Category, Department } from '../types';
import { storeService } from '../services/storeService';

const ProductsCatalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({
    name: '', description: '', price: 0, status: 'active', departmentId: 'dept-1', categoryId: 'cat-1'
  });

  const loadData = async () => {
    const data = await storeService.getProducts();
    setProducts(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newProd: Product = {
      ...formData,
      id: editId || 'p-' + Date.now(),
      brand: 'G-Labs',
      image: 'https://picsum.photos/seed/' + Date.now() + '/400/400',
      rating: 5,
      reviews: 0,
      tags: [],
      category: 'supplements'
    };

    await storeService.saveProduct(newProd);
    await loadData();
    setIsModalOpen(false);
    showFeedback("Produto salvo com sucesso no banco!");
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {feedback && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl border border-emerald-500 font-black text-xs uppercase tracking-widest animate-in slide-in-from-top-10">
          {feedback}
        </div>
      )}

      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase">Catálogo de Produtos</h2>
          <p className="text-slate-500">Gestão persistente via IndexedDB.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-emerald-500 transition-all">+ NOVO PRODUTO</button>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Produto</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Preço</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <img src={p.image} className="w-10 h-10 rounded-lg object-cover" alt="" />
                    <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                  </div>
                </td>
                <td className="px-6 py-5 font-black text-slate-900 text-sm">R$ {p.price.toFixed(2)}</td>
                <td className="px-6 py-5 text-right">
                  <button onClick={() => { setEditId(p.id); setFormData(p); setIsModalOpen(true); }} className="text-xs font-black text-blue-500 uppercase">Editar</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-slate-400 font-bold uppercase text-xs">Nenhum produto cadastrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-10 animate-in zoom-in-95">
            <h3 className="text-2xl font-black mb-8">Dados do Produto</h3>
            <form onSubmit={handleSave} className="space-y-6">
              <input required placeholder="Nome do Produto" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 font-bold outline-none" />
              <input required type="number" step="0.01" placeholder="Preço" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="w-full bg-slate-50 rounded-2xl p-5 font-bold outline-none" />
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs">SALVAR NO BANCO</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-5 bg-slate-100 text-slate-500 rounded-2xl font-bold uppercase text-xs">CANCELAR</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsCatalog;
