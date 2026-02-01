
import React from 'react';
import { UserRole } from '../types';

const ROLE_PERMISSIONS = [
  {
    // Fix: replaced UserRole.ADMIN with UserRole.ADMIN_MASTER
    role: UserRole.ADMIN_MASTER,
    description: 'Acesso total e irrestrito a todos os módulos do sistema.',
    permissions: ['Gerenciar Configurações', 'CRUD Usuários', 'Configurar Produtos', 'Visualizar Relatórios Financeiros', 'Gerir Afiliados']
  },
  {
    role: UserRole.AFFILIATE,
    description: 'Acesso às ferramentas de marketing e dashboard de vendas próprias.',
    permissions: ['Visualizar Produtos', 'Links de Afiliado', 'Dashboard de Vendas', 'Solicitar Saques']
  },
  {
    role: UserRole.CUSTOMER,
    description: 'Acesso básico para compra de produtos e perfil pessoal.',
    permissions: ['Comprar Produtos', 'Acessar Coach IA', 'Histórico de Pedidos', 'Editar Perfil']
  }
];

const Roles: React.FC = () => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900">Papéis e Permissões</h2>
        <p className="text-slate-500">Estrutura de RBAC (Role-Based Access Control) do sistema.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {ROLE_PERMISSIONS.map((item, i) => (
          <div key={i} className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
            {/* Fix: replaced UserRole.ADMIN with UserRole.ADMIN_MASTER */}
            <div className={`p-8 md:w-1/3 flex flex-col justify-center items-center text-center ${
              item.role === UserRole.ADMIN_MASTER ? 'bg-purple-50' : 
              item.role === UserRole.AFFILIATE ? 'bg-blue-50' : 'bg-slate-50'
            }`}>
              {/* Fix: replaced UserRole.ADMIN with UserRole.ADMIN_MASTER */}
              <span className={`text-4xl mb-4 ${
                item.role === UserRole.ADMIN_MASTER ? 'grayscale-0' : 'grayscale'
              }`}>
                {/* Fix: replaced UserRole.ADMIN with UserRole.ADMIN_MASTER */}
                {item.role === UserRole.ADMIN_MASTER ? '👑' : item.role === UserRole.AFFILIATE ? '🤝' : '👤'}
              </span>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{item.role}</h3>
              <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed px-4">{item.description}</p>
            </div>
            
            <div className="p-8 md:w-2/3">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Permissões Ativas</h4>
              <div className="flex flex-wrap gap-3">
                {item.permissions.map((p, j) => (
                  <div key={j} className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-emerald-500">✓</span>
                    <span className="text-sm font-bold text-slate-700">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10">
          <h3 className="text-xl font-black mb-2">Deseja criar um papel personalizado?</h3>
          <p className="text-slate-400 text-sm max-w-lg mb-6 leading-relaxed">A criação de novos papéis e permissões granulares está disponível no plano Enterprise Plus da G-FitLife.</p>
          <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-sm hover:bg-emerald-50 transition-colors">FALAR COM SUPORTE</button>
        </div>
      </div>
    </div>
  );
};

export default Roles;
