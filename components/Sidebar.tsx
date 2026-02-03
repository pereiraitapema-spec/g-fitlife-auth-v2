import React, { useState, useEffect } from 'react';
import { UserRole, SystemSettings } from '../types';
import { storeService } from '../services/storeService';
import { Route } from '../App';

interface SidebarProps {
  isOpen: boolean;
  currentRoute: string;
  onNavigate: (route: Route) => void;
  userRole: UserRole;
  onLogout: () => void;
  onSwitchToStore?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, currentRoute, onNavigate, userRole, onLogout, onSwitchToStore }) => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  const loadSettings = async () => {
    const s = await storeService.getSettings();
    setSettings(s);
  };

  useEffect(() => {
    loadSettings();
    window.addEventListener('systemSettingsChanged', loadSettings);
    return () => window.removeEventListener('systemSettingsChanged', loadSettings);
  }, []);

  if (!isOpen || !settings) return null;

  const NavItem: React.FC<{ id: Route; label: string; icon: string }> = ({ id, label, icon }) => (
    <button
      onClick={() => onNavigate(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all ${
        currentRoute === id 
          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'
      }`}
    >
      <span className="text-lg shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );

  const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
    <p className="px-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 mt-8 mb-3">{title}</p>
  );

  return (
    <aside className="w-72 bg-slate-900 h-full flex flex-col text-slate-300 border-r border-slate-800 transition-all duration-300 z-50 shrink-0">
      <div className="p-8 flex items-center gap-4 border-b border-slate-800">
        <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-800 shrink-0">
          <img src={settings.logoUrl} className="w-full h-full object-cover" alt="Logo" />
        </div>
        <div className="min-w-0">
          <span className="text-lg font-black text-white tracking-tighter block truncate uppercase">{settings.nomeLoja}</span>
          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest block">Enterprise Hub</span>
        </div>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {onSwitchToStore && (
          <button 
            onClick={onSwitchToStore}
            className="w-full mb-6 py-4 bg-white/5 border border-white/10 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-500 transition-all flex items-center justify-center gap-3"
          >
            🌐 VISUALIZAR LOJA
          </button>
        )}

        <NavItem id="dashboard" label="Visão Geral" icon="📊" />

        {(userRole === UserRole.ADMIN_MASTER || userRole === UserRole.ADMIN_OPERATIONAL) && (
          <>
            <SectionTitle title="Núcleo Master" />
            <NavItem id="core-settings" label="Configurações" icon="⚙️" />
            <NavItem id="core-users" label="Usuários" icon="👥" />
            <NavItem id="core-roles" label="Privilégios" icon="🛡️" />
          </>
        )}

        <SectionTitle title="Estoque & Vendas" />
        <NavItem id="products-catalog" label="Produtos" icon="📦" />
        <NavItem id="departments" label="Departamentos" icon="🏢" />
        <NavItem id="categories" label="Categorias" icon="🏷️" />
        <NavItem id="coupons" label="Cupons" icon="🎟️" />
        <NavItem id="orders" label="Pedidos" icon="🛒" />

        <SectionTitle title="Marketing IA" />
        <NavItem id="mkt-banners" label="Banners" icon="🖼️" />
        <NavItem id="mkt-remkt" label="Remarketing" icon="📩" />
        
        <SectionTitle title="Inteligência" />
        <NavItem id="ai-recom" label="Predicts" icon="🧠" />
        <NavItem id="ai-automations" label="Automações" icon="⚡" />

        <SectionTitle title="Ajuda" />
        <NavItem id="help-overview" label="Documentação" icon="🌍" />
      </nav>
      
      <div className="p-6 border-t border-slate-800">
        <button onClick={onLogout} className="w-full py-4 bg-red-500/10 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95">SAIR DO SISTEMA</button>
      </div>
    </aside>
  );
};

export default Sidebar;