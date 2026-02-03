import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
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

  const NavItem: React.FC<{ id: Route; label: string; icon: string }> = ({ id, label, icon }) => (
    <button
      onClick={() => onNavigate(id)}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
        currentRoute === id 
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm' 
          : 'hover:bg-slate-800 hover:text-white border border-transparent'
      }`}
    >
      <span className="text-lg shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );

  const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
    <p className="px-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mt-6 mb-2">{title}</p>
  );

  return (
    <aside className="w-64 bg-slate-900 h-full flex flex-col text-slate-300 border-r border-slate-800 transition-all duration-300 z-50 shrink-0">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-slate-700 bg-slate-800 shrink-0">
          <img src={settings.logoUrl} className="w-full h-full object-cover" alt="Logo" />
        </div>
        <div className="min-w-0">
          <span className="text-sm font-black text-white tracking-tight block truncate uppercase">{settings.nomeLoja}</span>
          <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest block">HUB ENTERPRISE</span>
        </div>
      </div>

      <nav className="flex-1 py-4 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {onSwitchToStore && (
          <button 
            onClick={onSwitchToStore}
            className="w-full mb-4 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
          >
            🌐 VISUALIZAR LOJA
          </button>
        )}

        <NavItem id="dashboard" label="Dashboard" icon="📊" />

        {(userRole === UserRole.ADMIN_MASTER || userRole === UserRole.ADMIN_OPERATIONAL) && (
          <>
            <SectionTitle title="Core do Sistema" />
            <NavItem id="core-settings" label="Configurações" icon="⚙️" />
            <NavItem id="core-users" label="Usuários" icon="👥" />
            <NavItem id="core-roles" label="Permissões RBAC" icon="🛡️" />
          </>
        )}

        <SectionTitle title="Catálogo & Operações" />
        <NavItem id="products-catalog" label="Inventário" icon="📦" />
        <NavItem id="departments" label="Departamentos" icon="🏢" />
        <NavItem id="categories" label="Categorias" icon="🏷️" />
        <NavItem id="coupons" label="Cupons" icon="🎟️" />
        <NavItem id="orders" label="Pedidos Logísticos" icon="🛒" />

        <SectionTitle title="Growth & Marketing" />
        <NavItem id="mkt-banners" label="Banners / Promo" icon="🖼️" />
        <NavItem id="mkt-remkt" label="Remarketing" icon="📩" />
        <NavItem id="mkt-chat" label="Auditoria Chat IA" icon="🤖" />
        
        <SectionTitle title="SEO & Performance" />
        <NavItem id="seo-onpage" label="SEO On-Page" icon="🔍" />
        <NavItem id="seo-tech" label="Robots & Sitemap" icon="🤖" />
        <NavItem id="seo-perf" label="Vitals Speed" icon="⚡" />
        <NavItem id="seo-audit" label="Logs Telemetria" icon="📜" />

        <SectionTitle title="Financeiro & Split" />
        <NavItem id="fin-gateways" label="API Gateways" icon="💳" />
        <NavItem id="fin-trans" label="Transações" icon="💹" />
        <NavItem id="fin-reports" label="Business Intel" icon="📈" />

        <SectionTitle title="Logística Hub" />
        <NavItem id="log-carriers" label="Carrier API" icon="🚚" />
        <NavItem id="log-rates" label="Simulador Frete" icon="📏" />
        <NavItem id="log-deliveries" label="Tracking Realtime" icon="📍" />

        {userRole === UserRole.ADMIN_MASTER && (
          <>
            <SectionTitle title="Marketplace B2B" />
            <NavItem id="mkp-sellers" label="Lojistas" icon="🏪" />
            <NavItem id="mkp-prods" label="Estoque Externo" icon="📦" />
            <NavItem id="mkp-orders" label="Vendas Mkp" icon="🛒" />
            <NavItem id="mkp-fin" label="Split Repasses" icon="💰" />

            <SectionTitle title="Intelligence AI" />
            <NavItem id="ai-recom" label="Recommendations" icon="🧠" />
            <NavItem id="ai-predict" label="Sales Predictions" icon="🔮" />
            <NavItem id="ai-automations" label="IA Automations" icon="⚡" />
            <NavItem id="ai-logs" label="Neural Logs" icon="🧬" />

            <SectionTitle title="Compliance & Infra" />
            <NavItem id="lgpd-consents" label="Consentimentos" icon="🛡️" />
            <NavItem id="lgpd-logs" label="Audit Trail" icon="⚖️" />
            <NavItem id="lgpd-policy" label="Textos Legais" icon="📜" />
            <NavItem id="infra-env" label="Environment" icon="🏗️" />
            <NavItem id="infra-deploy" label="Deploy Hub" icon="🚀" />
            <SectionTitle title="Segurança" />
            <NavItem id="sec-auth" label="Gestão Acesso" icon="🔐" />
            <NavItem id="sec-perms" label="Matriz Acesso" icon="🛡️" />
          </>
        )}

        <SectionTitle title="Support" />
        <NavItem id="help-overview" label="Documentação" icon="🌍" />
      </nav>
      
      <div className="p-4 border-t border-slate-800">
        <button onClick={onLogout} className="w-full py-3 bg-red-500/10 text-red-500 rounded-xl font-bold text-xs hover:bg-red-500 hover:text-white transition-all">SAIR DO SISTEMA</button>
      </div>
    </aside>
  );
};

export default Sidebar;