
import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { UserSession, UserRole } from '../types';

interface SecurityAuthProps {
  currentUser: UserSession;
}

const SecurityAuth: React.FC<SecurityAuthProps> = ({ currentUser }) => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newPass, setNewPass] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Adicionado await para carregar as sessões de usuários
    const load = async () => {
      setSessions(await storeService.getSessions());
    };
    load();
  }, []);

  const handleUpdateCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    setTimeout(() => {
      const success = storeService.updateAdminCredentials(currentUser.userId, newEmail, newPass);
      if (success) {
        alert('Credenciais atualizadas com sucesso! O acesso padrão foi desativado.');
        setNewEmail('');
        setNewPass('');
      }
      setIsUpdating(false);
    }, 1500);
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Segurança de Acesso</h2>
          <p className="text-slate-500 font-medium">Controle de credenciais e sessões ativas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Sessões Ativas */}
        <div className="lg:col-span-7 space-y-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Dispositivos Conectados</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sessions.map(s => (
              <div key={s.id} className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:scale-150 transition-all"></div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl">👤</div>
                  <div>
                    <p className="font-black text-slate-800 text-sm">{s.userName}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{s.userRole}</p>
                  </div>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Início Sessão</span>
                    <span className="text-slate-600">{new Date(s.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Status</span>
                    <span className="text-emerald-500 font-black">ATIVA</span>
                  </div>
                </div>

                <button className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">ENCERRAR ACESSO</button>
              </div>
            ))}
          </div>
        </div>

        {/* Troca de Credenciais */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900 rounded-[50px] p-10 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[100px] -mr-24 -mt-24"></div>
             <h3 className="text-2xl font-black mb-4 tracking-tight">Alterar Credenciais</h3>
             <p className="text-slate-400 text-sm font-medium mb-10">Troque o acesso padrão para garantir a integridade do seu ecossistema.</p>
             
             <form onSubmit={handleUpdateCredentials} className="space-y-6 relative z-10">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Novo Usuário / E-mail</label>
                 <input 
                   required
                   value={newEmail} 
                   onChange={e => setNewEmail(e.target.value)} 
                   className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none font-bold text-white focus:border-emerald-500 transition-all" 
                   placeholder="ex: ceo@gfitlife.com"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nova Senha Forte</label>
                 <input 
                   required
                   type="password"
                   value={newPass} 
                   onChange={e => setNewPass(e.target.value)} 
                   className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none font-bold text-white focus:border-emerald-500 transition-all" 
                   placeholder="••••••••"
                 />
               </div>
               <button 
                 type="submit" 
                 disabled={isUpdating}
                 className="w-full py-5 bg-emerald-500 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-emerald-600 transition-all disabled:opacity-50"
               >
                 {isUpdating ? 'ATUALIZANDO BACKEND...' : 'ATUALIZAR ACESSO'}
               </button>
             </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityAuth;
