import React, { useState, useEffect } from 'react';
import { UserSession, Affiliate, Product } from '../types';
import { storeService } from '../services/storeService';

interface AffiliatePortalProps {
  user: UserSession | null;
  onNavigate: (route: any) => void;
}

const AffiliatePortal: React.FC<AffiliatePortalProps> = ({ user, onNavigate }) => {
  const [affiliateData, setAffiliateData] = useState<Affiliate | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (user) {
        const affiliates = await storeService.getAffiliates();
        const found = affiliates.find(a => a.userId === user.userId);
        if (found) setAffiliateData(found);

        const prods = await storeService.getProducts();
        setProducts(prods.slice(0, 8));
      }
      setLoading(false);
    };
    load();
  }, [user]);

  if (!user || user.userRole !== 'affiliate') {
    return (
      <div className="py-20 text-center space-y-6">
        <div className="text-6xl">🔒</div>
        <h2 className="text-2xl font-black">Acesso restrito a Afiliados</h2>
        <button onClick={() => onNavigate('public-home')} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold">Voltar para Loja</button>
      </div>
    );
  }

  if (loading) return <div className="p-20 text-center">Sincronizando portal de parceiro...</div>;

  return (
    <div className="animate-in fade-in duration-700 space-y-12 pb-20">
      {/* Dashboard de Afiliado */}
      <section className="bg-slate-900 rounded-[50px] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="space-y-4">
             <div className="inline-block px-4 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest">Painel de Ganhos</div>
             <h2 className="text-4xl font-black tracking-tight">Olá, {user.userName.split(' ')[0]} 🤝</h2>
             <p className="text-slate-400 text-lg">Seu link de indicação global está ativo. Comece a faturar hoje.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-6 w-full md:w-auto">
             <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 text-center">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Meu Saldo</p>
                <p className="text-2xl font-black">R$ {affiliateData?.balance.toFixed(2) || '0.00'}</p>
             </div>
             <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 text-center">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Minha Taxa</p>
                <p className="text-2xl font-black">{affiliateData?.commissionRate || 15}%</p>
             </div>
          </div>
        </div>

        <div className="mt-12 p-8 bg-white/5 rounded-[40px] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-xl">🔗</div>
              <div>
                 <p className="text-[10px] font-black text-slate-500 uppercase">Link de Rastreio Principal</p>
                 <p className="text-sm font-mono text-emerald-400">gfitlife.io/?ref={affiliateData?.refCode || 'SINC-ERRO'}</p>
              </div>
           </div>
           <button onClick={() => { navigator.clipboard.writeText(`https://gfitlife.io/?ref=${affiliateData?.refCode}`); alert('Link copiado!'); }} className="px-8 py-4 bg-emerald-500 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all">COPIAR LINK GLOBAL</button>
        </div>
      </section>

      {/* Loja de Afiliado - Vitrine de Links */}
      <section className="space-y-10">
         <div className="border-b border-slate-100 pb-8">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Vitrine de <span className="text-emerald-500">Divulgação</span></h3>
            <p className="text-slate-500 font-medium">Selecione produtos específicos para criar campanhas de alta conversão.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map(p => (
              <div key={p.id} className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col">
                 <div className="aspect-square bg-slate-50 relative overflow-hidden">
                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.name} />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[9px] font-black text-emerald-600 uppercase">Comissão: R$ {(p.price * (affiliateData?.commissionRate || 15) / 100).toFixed(2)}</div>
                 </div>
                 <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                       <h4 className="font-black text-slate-800 text-sm line-clamp-1">{p.name}</h4>
                       <p className="text-emerald-500 font-black text-lg">R$ {p.price.toFixed(2)}</p>
                    </div>
                    <button 
                      onClick={() => { navigator.clipboard.writeText(`https://gfitlife.io/p/${p.id}?ref=${affiliateData?.refCode}`); alert('Link do produto copiado!'); }}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all"
                    >
                      COPIAR LINK REF
                    </button>
                 </div>
              </div>
            ))}
         </div>
      </section>
    </div>
  );
};

export default AffiliatePortal;