
import React, { useState, useEffect } from 'react';
import { Category, Department } from '../types';
import { storeService } from '../services/storeService';

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', departmentId: '', status: 'active' as 'active' | 'inactive' });
  const [feedback, setFeedback] = useState<string | null>(null);

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
      setFormData({ name: cat.name, departmentId: cat.departmentId, status: cat.status });
    } else {
      setEditId(null);
      setFormData({ name: '', departmentId: departments[0]?.id || '', status: 'active' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const catData: Category = {
      id: editId || 'cat-' + Date.now(),
      name: formData.name,
      departmentId: formData.departmentId,
      // Fix: Cast status
      status: formData.status as any
    };
    
    await storeService.saveCategory(catData);
    await loadData();
    setIsModalOpen(false);
    showFeedback("Salvo com sucesso");
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
          <p className="text-slate-500">Subdivisões gerenciadas pelo ecossistema.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold shadow-lg hover:bg-emerald-600 transition-all"
        >
          + NOVA CATEGORIA
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Nome</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Departamento</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {categories.map(cat => (
              <tr key={cat.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-5">
                  <p className="font-bold text-slate-800 text-sm">{cat.name}</p>
                </td>
                <td className="px-6 py-5">
                   <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase">
                    {getDeptName(cat.departmentId)}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <button onClick={() => handleOpenModal(cat)} className="text-xs font-black text-blue-500 uppercase">Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-10 animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-slate-900 mb-8">{editId ? 'Editar' : 'Nova'} Categoria</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <input required placeholder="Nome da Categoria" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 font-bold outline-none shadow-inner" />
              <select required value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 font-bold outline-none">
                <option value="" disabled>Selecione um departamento</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
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

export default CategoriesPage;
