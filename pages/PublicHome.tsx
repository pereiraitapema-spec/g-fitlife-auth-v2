import React, { useState, useEffect } from 'react';
import { Product, Banner, UserSession } from '../types';
import { storeService } from '../services/storeService';
import ProductCard from '../components/ProductCard';

interface PublicHomeProps {
  onNavigate: (route: any) => void;
  onAddToCart: (p: Product) => void;
}

const PublicHome: React.FC<PublicHomeProps> = ({ onNavigate, onAddToCart }) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<UserSession | null>(null);

  const loadData = async () => {
    const bData = await storeService.getBanners();
    const pData = await storeService.getProducts();
    setBanners(bData.filter(b => b.status === 'active'));
    setProducts(pData.slice(0, 4));
    setSession(storeService.getActiveSession());
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('sessionUpdated', loadData);
    return () => window.removeEventListener('sessionUpdated', loadData);
  }, []);

  if (loading) return null;

  return (
    <div className="animate-in fade-in duration-1000 space-y-24 pb-20">
      {/* Hero Banner */}
      <section className="relative h-[600px] w-full rounded-[60px] overflow-hidden group">
         {banners.length > 0 ? (
           <img src={banners[0].imageUrl} className="w-full h-full object-cover transition-transform duration-10000 group-hover:scale-110" alt={banners[0].title} />
         ) : (
           <div className="w-full h-full bg-slate-900 flex items-center justify-center">
              <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070" className="absolute inset-0 w-full h-full object-cover opacity-60" alt="" />
              <div className="relative z-10 text-center space-y-6">
                 <h2 className="text-6xl font-black text-white tracking-tighter">Sua Melhor Versão <br/> <span className="text-emerald-500 underline decoration-emerald-500/30">Começa Aqui.</span></h2>
                 <button onClick={() => onNavigate('store-catalog')} className="px-12 py-6 bg-emerald-500 text-white rounded-[30px] font-black text-lg shadow-2xl hover:bg-emerald-600 transition-all active:scale-95">VER CATÁLOGO 2024</button>
              </div>
           </div>
         )}
         {banners.length > 0 && (
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-20">
              <div className="space-y-4">
                 <h2 className="text-5xl font-black text-white tracking-tight">{banners[0].title}</h2>
                 <button onClick={() => onNavigate('store-catalog')} className="px-10 py-5 bg-emerald-500 text-white rounded-3xl font-black shadow-xl">APROVEITAR AGORA</button>
              </div>
           </div>
         )}
      </section>

      {/* Categorias Rápidas */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div onClick={() => onNavigate('departments')} className="h-[400px] bg-slate-50 rounded-[50px] p-12 flex flex-col justify-end group cursor-pointer overflow-hidden relative border border-slate-100 shadow-sm hover:shadow-xl transition-all">
            <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform" alt="" />
            <h3 className="text-3xl font-black text-slate-900 relative z-10">Saúde & <br/> Bem-Estar</h3>
            <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs mt-2 relative z-10">Explorar Seção →</p>
         </div>
         <div onClick={() => onNavigate('departments')} className="h-[400px] bg-emerald-500 rounded-[50px] p-12 flex flex-col justify-end group cursor-pointer overflow-hidden relative shadow-2xl shadow-emerald-500/20">
            <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform" alt="" />
            <h3 className="text-3xl font-black text-white relative z-10">Performance <br/> Extrema</h3>
            <p className="text-white/80 font-bold uppercase tracking-widest text-xs mt-2 relative z-10">Os mais vendidos →</p>
         </div>
         <div onClick={() => onNavigate('departments')} className="h-[400px] bg-slate-900 rounded-[50px] p-12 flex flex-col justify-end group cursor-pointer overflow-hidden relative shadow-2xl">
            <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2070" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform" alt="" />
            <h3 className="text-3xl font-black text-white relative z-10">Nutrição <br/> Inteligente</h3>
            <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs mt-2 relative z-10">Consultar Coach →</p>
         </div>
      </section>

      {/* Destaques */}
      <section className="space-y-12">
        <div className="flex justify-between items-end border-b border-slate-100 pb-8">
           <div>
              <h3 className="text-4xl font-black text-slate-900 tracking-tight">Os Mais <span className="text-emerald-500">Desejados</span></h3>
              <p className="text-slate-500 font-medium">Suplementos validados por nossa equipe de especialistas.</p>
           </div>
           <button onClick={() => onNavigate('store-catalog')} className="text-sm font-black uppercase tracking-widest text-slate-400 hover:text-emerald-500 transition-colors">Ver Tudo</button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
           {products.map(p => (
             <ProductCard 
                key={p.id} 
                product={p} 
                onAddToCart={onAddToCart} 
                user={session}
             />
           ))}
        </div>
      </section>

      {/* CTA Newsletter */}
      <section className="bg-slate-50 rounded-[60px] p-20 flex flex-col items-center text-center space-y-8 relative overflow-hidden border border-slate-100">
         <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-[40px] flex items-center justify-center text-5xl animate-bounce duration-[3000ms]">🎁</div>
         <div className="space-y-2">
            <h3 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Ganhe 15% de Desconto</h3>
            <p className="text-slate-500 font-medium">Na sua primeira compra utilizando o cupom enviado por nossa IA.</p>
         </div>
         <div className="flex gap-2 w-full max-w-md">
            <input placeholder="Seu melhor e-mail..." className="bg-white border-2 border-transparent focus:border-emerald-500 rounded-[24px] px-8 py-5 text-center font-bold text-slate-800 flex-1 outline-none transition-all shadow-sm" />
            <button className="px-10 py-5 bg-slate-900 text-white rounded-[24px] font-black text-sm uppercase tracking-widest shadow-xl hover:bg-emerald-500 transition-all">RESGATAR</button>
         </div>
      </section>
    </div>
  );
};

export default PublicHome;