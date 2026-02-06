import React, { useState, useEffect } from 'react';
import { Affiliate, Product } from '../types';
import { storeService } from '../services/storeService';

const AffiliatesLinks: React.FC = () => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedAff, setSelectedAff] = useState<string>('');
  const [trackingLinks, setTrackingLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadInitialData = async () => {
    setLoading(true);
    const [aData, pData] = await Promise.all([
      storeService.getAffiliates(),
      storeService.getProducts()
    ]);
    setAffiliates(aData.filter(a => a.status === 'active'));
    setProducts(pData.filter(p => p.status === 'active'));
    setLoading(false);
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadTrackingLinks = async (affId: string) => {
    const links = await storeService.getTrackingLinks(affId);
    setTrackingLinks(links);
  };

  useEffect(() => {
    if (selectedAff) {
      loadTrackingLinks(selectedAff);
    } else {
      setTrackingLinks([]);
    }
  }, [selectedAff]);

  const currentAff = affiliates.find(a => a.id === selectedAff);

  const handleGenerateUniqueLink = async (productId: string) => {
    if (!selectedAff || isGenerating) return;
    setIsGenerating(true);
    try {
      const res = await storeService.generateTrackingLink(selectedAff, productId);
      if (res.success) {
        alert('Link único de rastreamento gerado com sucesso!');
        await loadTrackingLinks(selectedAff);
      } else {
        alert('Erro ao gerar link: ' + res.error);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Link copiado para a área de transferência!');
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-10 pb-20">
      <div className="bg-slate-900 rounded-[50px] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[120px] -mr-32 -mt-32"></div>
        <div className="max-w-xl relative">
          <h2 className="text-3xl font-black mb-4 tracking-tight uppercase">Gerador de Links Refs</h2>
          <p className="text-slate-400 font-medium mb-10 leading-relaxed">Selecione um parceiro aprovado para gerenciar links de rastreamento de alta performance com monitoramento de visitas único.</p>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-4">Selecione o Parceiro</label>
            <select 
              value={selectedAff}
              onChange={e => setSelectedAff(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-[24px] px-8 py-5 text-lg font-black outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white"
            >
              <option value="" className="text-slate-900">Busque por Nome ou Código...</option>
              {affiliates.map(a => (
                <option key={a.id} value={a.id} className="text-slate-900">{a.name.toUpperCase()} (REF: {a.refCode})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-32 text-center">
           <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando com Supabase...</p>
        </div>
      ) : currentAff ? (
        <div className="space-y-12">
          {/* Grid de Produtos para Geração */}
          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-900 px-4 uppercase tracking-tight">Gerar Novos Links por Produto</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {products.map(p => (
                <div key={p.id} className="bg-white rounded-[40px] border border-slate-100 p-8 flex items-center gap-6 shadow-sm hover:shadow-xl transition-all group">
                  <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-lg border-2 border-slate-50 shrink-0">
                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{p.brand}</p>
                    <h4 className="font-black text-slate-800 text-sm mb-4 truncate">{p.name}</h4>
                    <div className="grid grid-cols-1 gap-2">
                       <button 
                        onClick={() => handleGenerateUniqueLink(p.id)}
                        disabled={isGenerating}
                        className="w-full py-3 bg-emerald-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50"
                       >
                         {isGenerating ? 'PROCESSANDO...' : 'GERAR LINK DE PERFORMANCE'}
                       </button>
                       <button 
                        onClick={() => copyToClipboard(`https://gfitlife.io/p/${p.id}?ref=${currentAff.refCode}`)}
                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
                       >
                         COPIAR LINK PADRÃO
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Listagem de Links de Rastreamento (Monitoramento) */}
          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-900 px-4 uppercase tracking-tight">Links Únicos Ativos (Monitoramento de Visitas)</h3>
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                     <tr>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produto</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Slug / Link</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Visitas</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {trackingLinks.map(tl => (
                        <tr key={tl.id} className="hover:bg-slate-50/50 transition-colors group">
                           <td className="px-8 py-5">
                              <p className="font-bold text-slate-800 text-sm">{tl.products?.name || 'Produto'}</p>
                              <p className="text-[10px] text-slate-400 uppercase font-black">{new Date(tl.created_at).toLocaleDateString()}</p>
                           </td>
                           <td className="px-8 py-5">
                              <div className="flex items-center gap-2">
                                 <code className="bg-slate-100 px-3 py-1 rounded text-[10px] font-bold text-emerald-600 tracking-tighter">
                                    gfit.io/{tl.slug}
                                 </code>
                              </div>
                           </td>
                           <td className="px-8 py-5 text-center">
                              <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-black shadow-sm">
                                 {tl.visits || 0}
                              </span>
                           </td>
                           <td className="px-8 py-5 text-right">
                              <button 
                                onClick={() => copyToClipboard(`https://gfitlife.io/track/${tl.slug}`)}
                                className="px-4 py-2 hover:bg-slate-900 hover:text-white rounded-xl border border-slate-200 text-slate-400 font-black text-[9px] uppercase transition-all"
                              >
                                Copiar Link
                              </button>
                           </td>
                        </tr>
                     ))}
                     {trackingLinks.length === 0 && (
                        <tr>
                           <td colSpan={4} className="px-8 py-20 text-center text-slate-300 font-black text-xs uppercase tracking-widest">
                              Nenhum link único gerado ainda para este afiliado.
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-32 text-center bg-white rounded-[60px] border-4 border-dashed border-slate-100 grayscale opacity-40 animate-in fade-in">
          <div className="text-7xl mb-8">🔗</div>
          <h3 className="text-2xl font-black text-slate-400 uppercase tracking-tighter">Aguardando Seleção</h3>
          <p className="text-slate-300 font-bold max-w-xs mx-auto mt-2">Escolha um afiliado acima para gerenciar os links de indicação e monitorar o engajamento da rede.</p>
        </div>
      )}

      <div className="bg-emerald-50 rounded-[40px] p-10 border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-8">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg">🚀</div>
            <div>
               <h4 className="text-xl font-black text-emerald-900 tracking-tight">Estatísticas de Engajamento em Tempo Real</h4>
               <p className="text-emerald-700 text-sm font-medium leading-relaxed">Cada link único permite monitorar cliques e origens, fornecendo insights valiosos para seus parceiros de elite.</p>
            </div>
         </div>
         <button className="px-8 py-4 bg-white text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm hover:shadow-md transition-all">Ver Manual de Conversão</button>
      </div>
    </div>
  );
};

export default AffiliatesLinks;