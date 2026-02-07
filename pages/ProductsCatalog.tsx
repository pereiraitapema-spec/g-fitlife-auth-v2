import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { storeService } from '../services/storeService';
import FileUpload from '../components/FileUpload';

const ProductsCatalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [feedback, setFeedback] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<any>({
    name: '', description: '', price: 0, status: 'active', departmentId: '', categoryId: '', image: '', brand: 'G-Labs'
  });

  const loadData = async () => {
    const data = await storeService.getProducts();
    setProducts(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showFeedback = (msg: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message: msg, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // CORREÇÃO: Usar UUID real para cumprir restrição do Supabase (erro 22P02)
      const newProd: Product = {
        ...formData,
        id: editId || crypto.randomUUID(),
        brand: formData.brand || 'G-Labs',
        image: formData.image || 'https://picsum.photos/seed/placeholder/400/400',
        rating: formData.rating || 5,
        reviews: formData.reviews || 0,
        tags: formData.tags || [],
        category: formData.category || 'supplements',
        status: formData.status,
        isAffiliate: formData.isAffiliate ?? false
      };

      await storeService.saveProduct(newProd);
      await loadData();
      setIsModalOpen(false);
      showFeedback("Produto persistido no Supabase!");
      setFormData({ name: '', description: '', price: 0, status: 'active', departmentId: '', categoryId: '', image: '', brand: 'G-Labs' });
      setEditId(null);
    } catch (err) {
      showFeedback("Erro ao salvar produto.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {feedback && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-top-10 pointer-events-none">
          <div className={`px-10 py-5 rounded-[40px] shadow-2xl border flex items-center gap-4 ${
            feedback.type === 'error' ? 'bg-red-500 border-red-400 text-white' : 'bg-slate-900 border-emerald-500 text-white'
          }`}>
             <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-black">✓</div>
             <span className="font-black text-[10px] uppercase tracking-widest">{feedback.message}</span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-end px-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Inventário G-Fit</h2>
          <p className="text-slate-500 font-medium">Gestão de produtos com sincronização em nuvem.</p>
        </div>
        <button 
          onClick={() => { setEditId(null); setFormData({ name: '', description: '', price: 0, status: 'active', departmentId: '', categoryId: '', image: '', brand: 'G-Labs' }); setIsModalOpen(true); }} 
          className="px-10 py-5 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl"
        >
          + NOVO PRODUTO
        </button>
      </div>

      <div className="bg-white rounded-[50px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produto</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Preço</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md border border-white">
                       <img src={p.image} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div>
                       <p className="font-black text-slate-800 text-sm tracking-tight">{p.name}</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase">{p.brand}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-center font-black text-slate-900">R$ {p.price.toFixed(2)}</td>
                <td className="px-8 py-6 text-center">
                   <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${p.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                     {p.status === 'active' ? '● Ativo' : '● Inativo'}
                   </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button onClick={() => { setEditId(p.id); setFormData(p); setIsModalOpen(true); }} className="px-4 py-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 text-blue-500 font-black text-[10px] uppercase transition-all">Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[50px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center">
               <h3 className="text-3xl font-black uppercase tracking-tight">{editId ? 'Editar Produto' : 'Novo Produto'}</h3>
               <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-slate-900 font-black">✕</button>
            </div>
            <div className="p-10 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSave} className="space-y-8">
                <FileUpload 
                  label="Foto do Produto (Local ou Web)" 
                  currentUrl={formData.image} 
                  onUploadComplete={url => setFormData({...formData, image: url})} 
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Nome do Produto</label>
                    <input required placeholder="Whey Isolate Pro..." value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 font-bold outline-none shadow-inner focus:ring-2 focus:ring-emerald-500/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Preço (R$)</label>
                    <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="w-full bg-slate-50 rounded-2xl p-5 font-bold outline-none shadow-inner" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Status</label>
                      <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 font-bold outline-none shadow-inner">
                         <option value="active">ATIVO (Visível na loja)</option>
                         <option value="inactive">INATIVO (Oculto)</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Marca</label>
                      <input placeholder="G-Labs" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 font-bold outline-none shadow-inner" />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Descrição Detalhada</label>
                   <textarea placeholder="Fale sobre os benefícios..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 font-bold outline-none shadow-inner h-32" />
                </div>

                <div className="flex gap-4 pt-4 sticky bottom-0 bg-white">
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-6 bg-slate-900 text-white rounded-[28px] font-black text-sm uppercase shadow-xl hover:bg-emerald-600 active:scale-95 transition-all">
                    {isSubmitting ? 'SINCRONIZANDO...' : 'SALVAR NO SUPABASE'}
                  </button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 py-6 bg-slate-100 text-slate-400 rounded-[28px] font-black text-sm uppercase">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsCatalog;