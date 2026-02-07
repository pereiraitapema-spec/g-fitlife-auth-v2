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
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // URLs otimizadas via Unsplash (WebP automático, compressão inteligente q=75 e largura otimizada)
  const HERO_IMAGE = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=75&w=1600&compress=true";
  const SUPPLEMENTS_IMAGE = "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=75&w=1000&compress=true";
  const EQUIPMENT_IMAGE = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=75&w=1000&compress=true";

  const loadData = async () => {
    const bData = await storeService.getBanners();
    const pData = await storeService.getProducts();
    setBanners(bData.filter(b => b.status === 'active'));
    setProducts(pData.slice(0, 8));
    setSession(storeService.getActiveSession());
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('sessionUpdated', loadData);
    return () => window.removeEventListener('sessionUpdated', loadData);
  }, []);

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
       <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-1000 space-y-24 pb-20">
      {/* Hero Section Master */}
      <section className="relative h-[650px] w-full rounded-[60px] overflow-hidden group shadow-2xl">
         {banners.length > 0 ? (
           <img src={banners[0].imageUrl} className="w-full h-full object-cover transition-transform duration-[10000ms] group-hover:scale-110" alt={banners[0].title} />
         ) : (
           <div className="w-full h-full bg-slate-900 flex items-center justify-center">
              <img src={HERO_IMAGE} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="G-FitLife Hero" />
              <div className="relative z-10 text-center space-y-10 px-6">
                 <div className="space-y-4">
                    <span className="px-6 py-2 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-[0.4em] shadow-xl">G-FITLIFE HUB ENTERPRISE</span>
                    <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">A Elite da <br/> <span className="text-emerald-500 italic">Performance Humana.</span></h2>
                    <p className="text-slate-300 text-lg max-w-xl mx-auto font-medium">Ciência, nutrição e tecnologia unidas para transformar seu potencial físico e mental.</p>
                 </div>
                 <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <button onClick={() => onNavigate('store-catalog')} className="px-12 py-6 bg-white text-slate-900 rounded-[32px] font-black text-lg shadow-2xl hover:bg-emerald-500 hover:text-white transition-all active:scale-95 flex items-center gap-3 group">
                       EXPLORAR COLEÇÃO
                       <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                    <button onClick={() => onNavigate('public-contact')} className="px-12 py-6 bg-white/5 backdrop-blur-md border border-white/20 text-white rounded-[32px] font-black text-lg hover:bg-white/10 transition-all">SABER MAIS</button>
                 </div>
              </div>
           </div>
         )}
         {banners.length > 0 && (
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent flex items-end p-12 md:p-24">
              <div className="space-y-6 max-w-2xl">
                 <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none">{banners[0].title}</h2>
                 <button onClick={() => onNavigate('store-catalog')} className="px-12 py-6 bg-emerald-500 text-white rounded-[32px] font-black text-lg shadow-2xl hover:bg-emerald-600 transition-all active:scale-95">REAPROVEITAR OFERTA</button>
              </div>
           </div>
         )}
      </section>

      {/* Bento Grid Categorias */}
      <section className="space-y-12">
         <div className="text-center space-y-3">
            <h3 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Ecossistema de Saúde</h3>
            <p className="text-slate-500 font-medium">Soluções modulares para cada fase da sua evolução.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-8 h-auto md:h-[600px]">
            {/* Bloco 1: Suplementos (Grande) */}
            <div onClick={() => onNavigate('departments')} className="md:col-span-2 md:row-span-2 bg-slate-100 rounded-[50px] p-12 flex flex-col justify-end group cursor-pointer overflow-hidden relative shadow-sm hover:shadow-2xl transition-all border border-slate-200/50">
               <img src={SUPPLEMENTS_IMAGE} className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-110 transition-transform duration-[2000ms]" alt="Suplementação" />
               <div className="relative z-10 space-y-4">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-xl">💊</div>
                  <h3 className="text-4xl font-black text-slate-900">Suplementação <br/> Avançada</h3>
                  <p className="text-emerald-600 font-black uppercase tracking-widest text-[10px] bg-white w-fit px-4 py-1.5 rounded-full shadow-sm">Pura Performance →</p>
               </div>
            </div>

            {/* Bloco 2: Equipamentos */}
            <div onClick={() => onNavigate('departments')} className="md:col-span-2 bg-emerald-500 rounded-[50px] p-10 flex flex-col justify-end group cursor-pointer overflow-hidden relative shadow-xl shadow-emerald-500/20">
               <img src={EQUIPMENT_IMAGE} className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform" alt="Equipamentos" />
               <div className="relative z-10 flex justify-between items-end">
                  <div>
                    <h3 className="text-3xl font-black text-white">Equipamentos <br/> Pro</h3>
                    <p className="text-emerald-100 font-bold uppercase tracking-widest text-[10px] mt-2">Tecnologia em Aço</p>
                  </div>
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white text-2xl group-hover:rotate-12 transition-transform">🏋️</div>
               </div>
            </div>

            {/* Bloco 3: Nutrição Digital */}
            <div onClick={() => onNavigate('departments')} className="bg-slate-900 rounded-[50px] p-8 flex flex-col justify-end group cursor-pointer overflow-hidden relative shadow-2xl">
               <div className="relative z-10 space-y-4">
                  <div className="text-3xl">📱</div>
                  <h3 className="text-xl font-black text-white">Planos <br/> Digitais</h3>
                  <p className="text-emerald-400 font-bold uppercase tracking-widest text-[9px]">IA Coach Ready</p>
               </div>
            </div>

            {/* Bloco 4: Lifestyle */}
            <div onClick={() => onNavigate('departments')} className="bg-white rounded-[50px] p-8 flex flex-col justify-end group cursor-pointer overflow-hidden relative border border-slate-100 shadow-sm hover:border-emerald-500 transition-all">
               <div className="relative z-10 space-y-4">
                  <div className="text-3xl">👕</div>
                  <h3 className="text-xl font-black text-slate-900">Apparel <br/> Elite</h3>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Conforto & Estilo</p>
               </div>
            </div>
         </div>
      </section>

      {/* Vitrine de Produtos Selecionados */}
      <section className="space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end border-b border-slate-100 pb-10 gap-6">
           <div className="text-center md:text-left">
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Destaques da Semana</h3>
              <p className="text-slate-500 font-medium">Os produtos mais desejados pela comunidade G-Fit.</p>
           </div>
           <button onClick={() => onNavigate('store-catalog')} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl">Ver catálogo completo</button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
           {products.length === 0 ? (
             Array(4).fill(0).map((_, i) => <div key={i} className="h-80 bg-slate-50 rounded-[40px] animate-pulse"></div>)
           ) : (
             products.map(p => (
               <ProductCard 
                  key={p.id} 
                  product={p} 
                  onAddToCart={onAddToCart} 
                  onQuickView={setQuickViewProduct}
                  user={session}
               />
             ))
           )}
        </div>
      </section>

      {/* QUICK VIEW MODAL (Homepage) */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-[50px] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
            <div className="md:w-1/2 bg-slate-50 relative">
              <img src={quickViewProduct.image} className="w-full h-full object-cover aspect-square md:aspect-auto" alt={quickViewProduct.name} />
              <button 
                onClick={() => setQuickViewProduct(null)} 
                className="absolute top-6 left-6 z-20 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg text-slate-400 hover:text-slate-900 md:hidden"
              >
                ✕
              </button>
            </div>
            <div className="md:w-1/2 p-8 md:p-12 space-y-8 flex flex-col justify-center relative">
              <button 
                onClick={() => setQuickViewProduct(null)} 
                className="absolute top-8 right-8 z-20 text-slate-300 hover:text-slate-900 hidden md:block"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="space-y-4">
                <p className="text-xs font-black text-emerald-500 uppercase tracking-[0.3em]">{quickViewProduct.brand}</p>
                <h3 className="text-3xl font-black text-slate-900 leading-tight">{quickViewProduct.name}</h3>
              </div>
              <div className="space-y-2">
                <span className="text-4xl font-black text-slate-900">R$ {quickViewProduct.price.toFixed(2)}</span>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">
                {quickViewProduct.description || "Descrição em carregamento..."}
              </p>
              <button 
                onClick={() => { onAddToCart(quickViewProduct); setQuickViewProduct(null); }}
                className="w-full py-6 bg-slate-900 text-white rounded-[28px] font-black text-lg shadow-2xl hover:bg-emerald-500 transition-all duration-300"
              >
                ADICIONAR AO CARRINHO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner de Autoridade & Confiança */}
      <section className="bg-slate-900 rounded-[60px] p-12 md:p-24 text-white flex flex-col md:flex-row items-center justify-between gap-16 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
         <div className="max-w-xl space-y-8 relative z-10 text-center md:text-left">
            <h3 className="text-5xl font-black tracking-tighter leading-none">O Futuro da Performance está no Hub.</h3>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
               Junte-se a mais de 50.000 atletas que utilizam o ecossistema G-FitLife para monitorar, nutrir e superar seus limites todos os dias. 
               Tecnologia auditada pelo Studio Enterprise.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-10 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
               <div className="text-center"><p className="text-3xl font-black">50k+</p><p className="text-[10px] font-bold uppercase tracking-widest">Membros</p></div>
               <div className="text-center"><p className="text-3xl font-black">120+</p><p className="text-[10px] font-bold uppercase tracking-widest">Produtos</p></div>
               <div className="text-center"><p className="text-3xl font-black">24/7</p><p className="text-[10px] font-bold uppercase tracking-widest">IA Support</p></div>
            </div>
         </div>
         <div className="relative group">
            <div className="absolute inset-0 bg-emerald-500 blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="w-80 h-80 bg-white/5 backdrop-blur-2xl rounded-[60px] border border-white/10 flex flex-col items-center justify-center p-12 text-center space-y-6 shadow-2xl relative z-10 hover:scale-105 transition-transform duration-500">
               <div className="w-24 h-24 bg-emerald-500 rounded-[40px] flex items-center justify-center text-5xl shadow-xl shadow-emerald-500/20">💎</div>
               <h4 className="text-2xl font-black">Club Elite</h4>
               <p className="text-sm text-slate-400 font-medium">Acesso prioritário a lançamentos e descontos de até 25% vitalícios.</p>
               <button onClick={() => onNavigate('affiliate-register')} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">PARTICIPAR AGORA</button>
            </div>
         </div>
      </section>
    </div>
  );
};

export default PublicHome;