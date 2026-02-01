
import React from 'react';
import { UserRole } from '../types';

const SecurityPermissions: React.FC = () => {
  const roles = [
    // Fix: replaced UserRole.ADMIN with UserRole.ADMIN_MASTER
    { role: UserRole.ADMIN_MASTER, desc: 'Controle Total do Ecossistema', perms: ['Segurança', 'Financeiro', 'Logística', 'Inventário', 'Marketing'] },
    { role: UserRole.AFFILIATE, desc: 'Operação de Vendas e Links', perms: ['Vitrine', 'Links Ref', 'Comissões', 'Marketing Banners'] },
    { role: UserRole.CUSTOMER, desc: 'Consumidor Final', perms: ['Vitrine', 'Checkout', 'Chat IA', 'Meus Pedidos'] },
  ];

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Matriz de Permissões</h2>
          <p className="text-slate-500 font-medium">Configuração de privilégios por nível de acesso.</p>
        </div>
      </div>

      <div className="space-y-6">
        {roles.map((r, i) => (
          <div key={i} className="bg-white rounded-[40px] border border-slate-100 p-10 flex flex-col md:flex-row gap-10 items-center shadow-sm">
             <div className="md:w-1/4 text-center md:text-left">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{r.role}</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">{r.desc}</p>
             </div>
             <div className="flex-1 flex flex-wrap gap-3">
                {r.perms.map((p, j) => (
                  <span key={j} className="px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    ✓ {p}
                  </span>
                ))}
             </div>
             <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all">Editar Escopo</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecurityPermissions;
