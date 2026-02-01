
import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { RoleDefinition, UserRole } from '../types';

const CoreRoles: React.FC = () => {
  const [roles, setRoles] = useState<RoleDefinition[]>(storeService.getRoles());
  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(roles[0]);

  const handleTogglePermission = (routeId: string, field: 'canView' | 'canCreate' | 'canEdit' | 'canDelete') => {
    if (!selectedRole) return;
    
    const updatedPerms = selectedRole.permissions.map(p => 
      p.routeId === routeId ? { ...p, [field]: !p[field] } : p
    );
    
    const updatedRole = { ...selectedRole, permissions: updatedPerms };
    setSelectedRole(updatedRole);
    storeService.saveRole(updatedRole);
    setRoles(storeService.getRoles());
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Matriz RBAC</h2>
          <p className="text-slate-500 font-medium">Defina granularmente o que cada grupo de usuários pode realizar.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Papéis Registrados</p>
          <div className="space-y-2">
            {roles.map(r => (
              <button 
                key={r.id}
                onClick={() => setSelectedRole(r)}
                className={`w-full p-6 rounded-[32px] border text-left transition-all flex justify-between items-center ${
                  selectedRole?.id === r.id ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white border-slate-100 hover:border-emerald-500'
                }`}
              >
                <div>
                   <p className="text-sm font-black uppercase tracking-widest">{r.label}</p>
                   <p className={`text-[10px] font-bold mt-1 ${selectedRole?.id === r.id ? 'text-slate-400' : 'text-slate-400'}`}>ID: {r.id}</p>
                </div>
                {selectedRole?.id === r.id && <span className="text-emerald-500">🛡️</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8">
           {selectedRole ? (
             <div className="bg-white rounded-[50px] border border-slate-100 shadow-xl overflow-hidden animate-in slide-in-from-right-10">
                <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                   <h3 className="text-xl font-black text-slate-900 uppercase">Configuração de Escopo: {selectedRole.label}</h3>
                   <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full uppercase tracking-widest">Sincronizado</span>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead className="bg-white border-b border-slate-50">
                         <tr>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">Módulo / Rota</th>
                            <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase text-center">Ver</th>
                            <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase text-center">Criar</th>
                            <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase text-center">Editar</th>
                            <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase text-center">Excluir</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {selectedRole.permissions.map(p => (
                            <tr key={p.routeId} className="hover:bg-slate-50 transition-colors">
                               <td className="px-8 py-5">
                                  <p className="font-bold text-slate-800 text-sm uppercase tracking-tight">{p.routeId.replace('-', ' ')}</p>
                               </td>
                               {['canView', 'canCreate', 'canEdit', 'canDelete'].map(field => (
                                  <td key={field} className="px-4 py-5 text-center">
                                     <button 
                                      onClick={() => handleTogglePermission(p.routeId, field as any)}
                                      className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center mx-auto border-2 ${
                                        p[field as keyof typeof p] 
                                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                                          : 'bg-white border-slate-100 text-slate-200'
                                      }`}
                                     >
                                        {p[field as keyof typeof p] ? '✓' : '✕'}
                                     </button>
                                  </td>
                               ))}
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
           ) : (
             <div className="h-full flex items-center justify-center p-20 grayscale opacity-40">
                <p className="font-black uppercase tracking-widest text-xs">Selecione um papel na lista lateral.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default CoreRoles;
