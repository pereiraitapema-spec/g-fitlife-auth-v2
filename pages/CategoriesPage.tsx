
import React, { useState, useEffect } from 'react';
import { Category, Department } from '../types';
import { storeService } from '../services/storeService';

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    departmentId: '', 
    status: 'active' as 'active' | 'inactive',
    slug: '',
    icon: '',
    description: ''
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    const dData = await storeService.getDepartments();
    const cData = await storeService.getCategories();
    setDepartments(dData);
    setCategories(cData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleOpenModal = (cat?: Category) => {
    if (cat) {
      setEditId(cat.id);
      setFormData({ 
        name: cat.name, 
        departmentId: cat.departmentId, 
        status: cat.status,
        slug: cat.slug || '',
        icon: cat.icon || '',
        description: cat.description || ''
      });
    } else {
      setEditId(null);
      setFormData({ 
        name: '', 
        departmentId: departments[0]?.id || '', 
        status: 'active',
        slug: '',
        icon: '',
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const catData: Category = {
        // CORREÇÃO: Usar UUID para novos registros
        id: editId || crypto.randomUUID(),
        name: formData.name,
        departmentId: formData.departmentId,
        status: formData.status as any,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        icon: formData.icon,
        description: formData.description
      };
      
      await storeService.saveCategory(catData);
      await loadData();
      setIsModalOpen(false);
      showFeedback("Salvo com sucesso");
    } catch (error) {
      showFeedback("Erro ao salvar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDeptName = (id: string) => departments.find(d => d.id === id)?.name || 'N/A';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      {feedback && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] bg-slate-900 text-white px-8 py-4 rounded-3xl shadow-2xl border border-emerald-500 font-black text-xs uppercase tracking-widest animate-in slide-in-from-top-10">
          {feedback}
        </div>
      )}

      <div className="flex justify-between items-end px-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase">Categorias</h2>
          <p className="text-slate-500">Subdivisões gerenciadas pelo ecossistema Supabase.</p>
        </div>
        <button 
          disabled={isSubmitting}
          onClick={() => handleOpenModal()}
          className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold shadow-lg hover:bg-emerald-600 transition-all disabled:opacity-50"
        >
          + NOVA CATEGORIA
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Nome</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Ícone</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Departamento</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {categories.map(cat => (
              <tr key={cat.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-5">
                  <p className="font-bold text-slate-800 text-sm">{cat.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-tighter">/{cat.slug}</p>
                </td>
                <td className="px-6 py-5 text-center text-xl">
                  {cat.icon || '📦'}
                </td>
                <td className="px-6 py-5">
                   <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase">
                    {getDeptName(cat.departmentId)}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <button disabled={isSubmitting} onClick={() => handleOpenModal(cat)} className="text-xs font-black text-blue-500 uppercase disabled:opacity-30">Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{editId ? 'Editar' : 'Nova'} Categoria</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-slate-900 font-black">✕</button>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Nome da Categoria</label>
                    <input required disabled={isSubmitting} placeholder="Suplementos, Equipamentos..." value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 font-bold outline-none shadow-inner" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Slug Amigável</label>
                    <input required disabled={isSubmitting} placeholder="suplementos-elite" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} className="w-full bg-slate-50 rounded-2xl p-5 font-bold outline-none shadow-inner" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Departamento Pai</label>
                    <select required disabled={isSubmitting} value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 font-bold outline-none">
                      <option value="" disabled>Selecione um departamento</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Emoji / Ícone</label>
                    <input disabled={isSubmitting} placeholder="💊" value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 font-bold outline-none shadow-inner" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Descrição da Categoria (Para SEO)</label>
                  <textarea disabled={isSubmitting} placeholder="Produtos focados em alta performance..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 font-bold outline-none shadow-inner h-24" />
                </div>

                <div className="flex gap-4 pt-4 sticky bottom-0 bg-white">
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs disabled:opacity-50">
                    {isSubmitting ? 'SALVANDO NO SUPABASE...' : 'SALVAR CATEGORIA'}
                  </button>
                  <button type="button" disabled={isSubmitting} onClick={() => setIsModalOpen(false)} className="px-8 py-5 bg-slate-100 text-slate-500 rounded-2xl font-bold uppercase text-xs">CANCELAR</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
