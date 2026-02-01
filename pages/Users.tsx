
import React, { useState, useEffect } from 'react';
import { AppUser, UserRole, UserStatus } from '../types';
import { storeService } from '../services/storeService';

const Users: React.FC = () => {
  const [users, setUsers] = useState<AppUser[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await storeService.getUsers();
      setUsers(data);
    };
    load();
  }, []);

  const handleToggleStatus = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (user) {
      const newStatus = user.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE;
      await storeService.updateUserStatus(id, newStatus);
      const data = await storeService.getUsers();
      setUsers(data);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Usuários Ativos</h2>
          <p className="text-slate-500">Dados persistidos no nível do ecossistema.</p>
        </div>
      </div>
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr><th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Usuário</th><th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Papel</th><th className="px-6 py-4 text-xs font-black text-slate-400 uppercase text-right">Ações</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 transition-all">
                <td className="px-6 py-5 font-bold text-slate-800 text-sm">{u.name}<p className="text-[10px] text-slate-400 font-medium">{u.email}</p></td>
                <td className="px-6 py-5"><span className="text-[10px] font-black uppercase bg-slate-100 px-3 py-1 rounded-full">{u.role}</span></td>
                <td className="px-6 py-5 text-right"><button onClick={() => handleToggleStatus(u.id)} className="text-xs font-black text-emerald-500 uppercase">{u.status === UserStatus.ACTIVE ? 'Desativar' : 'Ativar'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
