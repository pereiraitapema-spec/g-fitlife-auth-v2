
import React, { useState, useEffect } from 'react';
import { Department } from '../types';
import { storeService } from '../services/storeService';

const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', status: 'active' as 'active' | 'inactive' });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    const data = await storeService.getDepartments();
    setDepartments(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleOpenModal = (dept?: Department) => {
    if (dept) {
      setEditId(dept.id);
      setFormData({ name: dept.name, status: dept.status });
    } else {
      setEditId(null);
      setFormData({ name: '', status: 'active' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const deptData: Department = {
        // CORREÇÃO: Usar UUID para novos registros
        id: editId || crypto.randomUUID(),
        name: formData.name,
        status: formData.status as any
      };
      
      await storeService.saveDepartment(deptData);
      await loadData();
      setIsModalOpen(false);
      showFeedback("Salvo com sucesso");
    } catch (error) {
      showFeedback("Erro ao salvar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (dept: Department) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const updated = { ...dept, status: dept.status === 'active' ? 'inactive' : 'active' } as Department;
      await storeService.saveDepartment(updated);
      await loadData();
      showFeedback("Status atualizado");
    } catch (error) {
      showFeedback("Erro ao atualizar status");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      {feedback && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] bg-slate-900 text-white px-8 py-4 rounded-3xl shadow-2xl border border-emerald-500 font-black text-xs uppercase tracking-widest animate-in slide-in-from-top-10">
          {feedback}
        </div>
      )}

      <div className="flex justify-between items-end px-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase">Departamentos</h2>
          <p className="text-slate-500">Persistência segura em Supabase Cloud.</p>
        </div>
        <button 
          disabled={isSubmitting}
          onClick={() => handleOpenModal()}
          className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg disabled:opacity-50"
        >
          + NOVO DEPARTAMENTO
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Nome</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {departments.map(dept => (
              <tr key={dept.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-5">
                  <p className="font-bold text-slate-800 text-sm">{dept.name}</p>
                </td>
                <td className="px-6 py-5">
                  <span className={`flex items-center gap-1.5 text-xs font-bold ${dept.status === 'active' ? 'text-emerald-500' : 'text-slate-400'}`}>
                    <span className={`w-2 h-2 rounded-full ${dept.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                    {dept.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-3">
                    <button disabled={isSubmitting} onClick={() => handleOpenModal(dept)} className="text-xs font-black text-blue-500 uppercase disabled:opacity-30">Editar</button>
                    <button disabled={isSubmitting} onClick={() => toggleStatus(dept)} className="text-xs font-black text-slate-400 uppercase disabled:opacity-30">Alternar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-10 animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-slate-900 mb-8">{editId ? 'Editar' : 'Novo'} Departamento</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <input required disabled={isSubmitting} placeholder="Nome do Departamento" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold outline-none shadow-inner" />
              <select disabled={isSubmitting} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold outline-none">
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={isSubmitting} className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs disabled:opacity-50">
                  {isSubmitting ? 'SALVANDO...' : 'SALVAR NO BANCO'}
                </button>
                <button type="button" disabled={isSubmitting} onClick={() => setIsModalOpen(false)} className="px-8 py-5 bg-slate-100 text-slate-500 rounded-2xl font-bold uppercase text-xs">CANCELAR</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
