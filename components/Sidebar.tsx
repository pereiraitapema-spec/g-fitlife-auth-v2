
import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { storeService } from '../services/storeService';

interface SidebarProps {
  isOpen: boolean;
  currentRoute: string;
  onNavigate: (route: any) => void;
  userRole: UserRole;
  onLogout: () => void;
  onSwitchToStore?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, currentRoute, onNavigate, userRole, onLogout, onSwitchToStore }) => {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const s = await storeService.getSettings();
      setSettings(s);
    };
    load();
    window.addEventListener('systemSettingsChanged', load);
    return () => window.removeEventListener('systemSettingsChanged', load);
  }, []);

  if (!isOpen || !settings) return null;

  const NavItem: React.FC<{ item: any }> = ({ item }) => (
    <button
      onClick={() => onNavigate(item.id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
        currentRoute === item.id 
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm' 
          : 'hover:bg-slate-800 hover:text-white border border-transparent'
      }`}
    >
      <span className="text-lg">{item.icon}</span>
      {item.label}
    </button>
  );

  return (
    <aside className="w-64 bg-slate-900 h-full flex flex-col text-slate-300 border-r border-slate-800 transition-all duration-300 z-50 shrink-0">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-slate-700 bg-slate-800 flex-shrink-0">
          <img src={settings.logoUrl} className="w-full h-full object-cover" alt="Logo" />
        </div>
        <div className="min-w-0">
          <span className="text-sm font-black text-white tracking-tight block truncate uppercase">{settings.nomeLoja}</span>
          <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest block">ADMIN CONSOLE</span>
        </div>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-6 overflow-y-auto custom-scrollbar">
        {onSwitchToStore && (
          <button 
            onClick={onSwitchToStore}
            className="w-full mb-4 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
          >
            🌐 ACESSAR LOJA CLIENTE
          </button>
        )}

        <NavItem item={{ id: 'dashboard', label: 'Dashboard', icon: '📊' }} />

        {userRole === UserRole.ADMIN_MASTER && (
          <div>
            <p className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Core do Sistema</p>
            <div className="space-y-1">
               <NavItem item={{ id: 'core-settings', label: 'Config. Gerais', icon: '⚙️' }} />
               <NavItem item={{ id: 'core-users', label: 'Usuários', icon: '👥' }} />
            </div>
          </div>
        )}

        <div>
          <p className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Catálogo & Ofertas</p>
          <div className="space-y-1">
            <NavItem item={{ id: 'products-catalog', label: 'Produtos', icon: '📦' }} />
            <NavItem item={{ id: 'departments', label: 'Departamentos', icon: '🏢' }} />
            <NavItem item={{ id: 'categories', label: 'Categorias', icon: '🏷️' }} />
            <NavItem item={{ id: 'coupons', label: 'Cupons', icon: '🎟️' }} />
          </div>
        </div>

        <div>
          <p className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Operações</p>
          <div className="space-y-1">
            <NavItem item={{ id: 'orders', label: 'Pedidos', icon: '🛒' }} />
          </div>
        </div>

        <div>
          <p className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Documentação</p>
          <div className="space-y-1">
            <NavItem item={{ id: 'help-overview', label: 'Visão Geral', icon: '🌍' }} />
            <NavItem item={{ id: 'help-core-detail', label: 'Manual Core', icon: '📘' }} />
          </div>
        </div>
      </nav>
      
      <div className="p-4 border-t border-slate-800">
        <button onClick={onLogout} className="w-full py-3 bg-red-500/10 text-red-500 rounded-xl font-bold text-xs hover:bg-red-500 hover:text-white transition-all">SAIR</button>
      </div>
    </aside>
  );
};

export default Sidebar;
