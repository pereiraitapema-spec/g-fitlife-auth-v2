import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { AppUser, UserRole, UserStatus } from '../types';
import FileUpload from '../components/FileUpload';

const CoreUsers: React.FC = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [session, setSession] = useState(storeService.getActiveSession());
  const [roles] = useState(storeService.getRoles());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{message: string, type: 'success' | 'error' | 'warning'} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<Partial<AppUser>>({ 
    id: '', name: '', email: '', role: UserRole.CUSTOMER, status: UserStatus.ACTIVE, loginType: 'email'
  });

  const [adminFormData, setAdminFormData] = useState({
    name: '', email: '', password: '', role: UserRole.ADMIN_MASTER
  });

  const isMaster = session?.userRole === UserRole.ADMIN_MASTER;

  const loadData = async () => {
    const data = await storeService.getUsers();
    setUsers([...data]);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('usersChanged', loadData);
    return () => window.removeEventListener('usersChanged', loadData);
  }, []);

  const showFeedback = (msg: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setFeedback({ message: msg, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await storeService.createAdminUser(adminFormData);
      showFeedback("Novo administrador criado com sucesso!");
      setIsAdminModalOpen(false);
      setAdminFormData({ name: '', email: '', password: '', role: UserRole.ADMIN_MASTER });
      await loadData();
    } catch (err) {
      showFeedback(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const isEdit = !!formData.id;
      const userData: AppUser = {
        id: formData.id || 'u-' + Date.now(),
        name: formData.name || '',
        email: formData.email || '',
        role: formData.role as UserRole,
        status: formData.status as UserStatus,
        loginType: formData.loginType as any,
        googleId: formData.googleId || '',
        createdAt: formData.createdAt || new Date().toISOString(),
      };

      await storeService.saveUser(userData);
      await loadData(); 
      setIsModalOpen(false);
      showFeedback(isEdit ? "Alteração salva!" : "Usuário criado!");
    } catch (error) {
      showFeedback("Erro ao salvar: " + error, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (id: string) => {
    const u = users.find(x => x.id === id);
    if (u) {
      const updatedStatus = u.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE;
      await storeService.updateUserStatus(id, updatedStatus);
      await loadData();
      showFeedback("Status atualizado!");
    }
  };

  const handleDelete = async () => {
    if (userToDelete) {
      const u = users.find(x => x.id === userToDelete);
      if (u?.email === 'admin@system.local') {
         showFeedback("Impossível deletar o System Core Admin", "error");
         setIsConfirmDeleteOpen(false);
         return;
      }

      const success = await storeService.deleteUser(userToDelete);
      if (success) {
        await loadData();
        showFeedback("Usuário removido!");
      } else {
        showFeedback("Falha ao remover do banco", "error");
      }
      setIsConfirmDeleteOpen(false);
      setUserToDelete(null);
    }
  };

  const getRoleLabel = (roleId: string) => roles.find(r => r.id === roleId)?.label || 'Usuário Final';

  return (
    <div className="animate-in fade-in duration-700 pb-20 space-y-10 min-h-screen">
      {feedback && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-top-10">
          <div className={`px-10 py-5 rounded-[40px] shadow-2xl border flex items-center gap-4 ${
            feedback.type === 'error' ? 'bg-red-500 text-white border-red-400' : 'bg-slate-900 text-white border-emerald-500'
          }`}>
             <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-black">✓</div>
             <span className="font-black text-xs uppercase tracking-widest">{feedback.message}</span>
          </div>
        </div>
      )}

      {isConfirmDeleteOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[50px] shadow-2xl p-12 text-center max-w-sm w-full">
            <h3 className="text-2xl font-black mb-10">Remover Acesso?</h3>
            <p className="text-slate-500 mb-8 text-sm">Esta ação é irreversível no Supabase.</p>
            <div className="flex gap-4">
              <button onClick={handleDelete} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase">EXCLUIR</button>
              <button onClick={() => setIsConfirmDeleteOpen(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-black text-xs uppercase">CANCELAR</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-end gap-6 px-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 uppercase">Colaboradores</h2>
          <p className="text-slate-500 text-lg">Persistência real no Supabase com auditoria Master.</p>
        </div>
        <div className="flex gap-4">
           {isMaster && (
             <button 
               onClick={() => setIsAdminModalOpen(true)} 
               className="px-10 py-5 bg-emerald-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl"
             >
               👑 CRIAR NOVO ADMIN
             </button>
           )}
           <button 
             onClick={() => { setFormData({ role: UserRole.CUSTOMER }); setIsModalOpen(true); }} 
             className="px-10 py-5 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all"
           >
             + NOVO CADASTRO
           </button>
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="bg-white rounded-[50px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuário</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tipo</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black overflow-hidden border-2 border-white shadow-md">
                         <img src={u.googleId || `https://ui-avatars.com/api/?name=${u.name}&background=0f172a&color=fff&bold=true`} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm">{u.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                     <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${u.role === UserRole.ADMIN_MASTER ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-500'}`}>{getRoleLabel(u.role)}</span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${u.status === UserStatus.ACTIVE ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{u.status === UserStatus.ACTIVE ? '● Ativo' : '● Suspenso'}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                     <div className="flex justify-end gap-3">
                        <button onClick={() => { setFormData(u); setIsModalOpen(true); }} className="px-4 py-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 text-blue-500 font-black text-[10px] uppercase">Editar</button>
                        <button onClick={() => toggleStatus(u.id)} className="px-4 py-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 text-slate-400 font-black text-[10px] uppercase">Status</button>
                        {u.email !== 'admin@system.local' && (isMaster || u.role !== UserRole.ADMIN_MASTER) && (
                          <button onClick={() => { setUserToDelete(u.id); setIsConfirmDeleteOpen(true); }} className="px-4 py-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 text-red-400 font-black text-[10px] uppercase">Deletar</button>
                        )}
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Criar Novo Admin (Apenas Master) */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[50px] shadow-2xl p-12 animate-in zoom-in-95">
             <h3 className="text-3xl font-black uppercase mb-8 text-emerald-600">Novo Administrador</h3>
             <form onSubmit={handleCreateAdmin} className="space-y-6">
                <input required placeholder="Nome do Admin" value={adminFormData.name} onChange={e => setAdminFormData({...adminFormData, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-6 font-bold outline-none shadow-inner" />
                <input required type="email" placeholder="E-mail" value={adminFormData.email} onChange={e => setAdminFormData({...adminFormData, email: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-6 font-bold outline-none shadow-inner" />
                <input required type="password" placeholder="Senha Temporária" value={adminFormData.password} onChange={e => setAdminFormData({...adminFormData, password: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-6 font-bold outline-none shadow-inner" />
                <select value={adminFormData.role} onChange={e => setAdminFormData({...adminFormData, role: e.target.value as any})} className="w-full bg-slate-50 border-none rounded-2xl p-6 font-bold outline-none">
                   <option value={UserRole.ADMIN_MASTER}>ADMIN MASTER (Total)</option>
                   <option value={UserRole.ADMIN_OPERATIONAL}>OPERACIONAL</option>
                   <option value={UserRole.FINANCE}>FINANCEIRO</option>
                </select>
                <div className="flex gap-4 pt-6">
                   <button type="submit" disabled={isSubmitting} className="flex-1 py-6 bg-emerald-600 text-white rounded-[24px] font-black uppercase text-xs">CRIAR NO BANCO</button>
                   <button type="button" onClick={() => setIsAdminModalOpen(false)} className="px-8 py-6 bg-slate-100 text-slate-500 rounded-[24px] font-bold uppercase text-xs">CANCELAR</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Modal Editar Usuário Comum */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[50px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95">
            <div className="p-10 border-b border-slate-50"><h3 className="text-3xl font-black uppercase">Dados do Usuário</h3></div>
            <div className="p-10 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSaveUser} className="space-y-8">
                <FileUpload label="Avatar" currentUrl={formData.googleId || ''} onUploadComplete={url => setFormData({...formData, googleId: url})} circular />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <input required placeholder="Nome" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 rounded-[20px] p-5 font-bold outline-none shadow-inner" />
                  <input required disabled={formData.email === 'admin@system.local'} placeholder="E-mail" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 rounded-[20px] p-5 font-bold outline-none shadow-inner" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})} className="w-full bg-slate-50 rounded-[20px] p-5 font-bold outline-none shadow-inner">
                    {roles.map(r => <option key={r.id} value={r.id}>{r.label.toUpperCase()}</option>)}
                  </select>
                  <select value={formData.loginType} onChange={e => setFormData({...formData, loginType: e.target.value as any})} className="w-full bg-slate-50 rounded-[20px] p-5 font-bold outline-none shadow-inner">
                    <option value="email">E-mail e Senha</option>
                    <option value="google">Google SSO</option>
                  </select>
                </div>
                <div className="flex gap-4 pt-10 sticky bottom-0 bg-white">
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-6 bg-slate-900 text-white rounded-[28px] font-black text-sm uppercase">{isSubmitting ? 'SINCRONIZANDO...' : 'SALVAR NO BANCO'}</button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 py-6 bg-slate-100 text-slate-50 text-slate-400 rounded-[28px] font-black text-sm uppercase">CANCELAR</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoreUsers;