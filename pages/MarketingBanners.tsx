import React, { useState, useEffect } from 'react';
import { Banner } from '../types';
import { storeService } from '../services/storeService';
import FileUpload from '../components/FileUpload';

const MarketingBanners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<Banner>>({
    title: '', imageUrl: '', linkType: 'product', targetId: '', status: 'active', startDate: '', endDate: ''
  });

  const loadData = async () => {
    const data = await storeService.getBanners();
    setBanners(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    // Validação mínima de interface
    if (!formData.title?.trim()) {
        alert("Por favor, informe um título interno para este banner.");
        return;
    }
    if (!formData.imageUrl?.trim()) {
        alert("A imagem do banner é obrigatória. Faça o upload antes de salvar.");
        return;
    }

    setIsSubmitting(true);
    try {
      // Função auxiliar local para validar UUID antes de persistir
      const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

      // GARANTIR UUID VÁLIDO: Se for um novo banner ou o ID atual for inválido (ex: BAN-...),
      // geramos um novo UUID via crypto para cumprir restrições do banco.
      const finalId = (formData.id && isUUID(formData.id)) ? formData.id : crypto.randomUUID();
      
      const newBanner = {
        ...formData,
        id: finalId
      } as Banner;
      
      console.log("[GFIT-BANNER-UI] Iniciando salvamento (Sem datas para evitar erro 400):", newBanner);
      
      await storeService.saveBanner(newBanner);
      await loadData();
      setIsModalOpen(false);
      
      // Limpeza completa do estado
      setFormData({ title: '', imageUrl: '', linkType: 'product', targetId: '', status: 'active', startDate: '', endDate: '' });
      alert("Configurações do banner persistidas no Supabase!");
    } catch (error: any) {
      console.error("[GFIT-BANNER-ERROR] Falha na operação visual:", error);
      alert(`Erro ao salvar banner: ${error.message || "Tente novamente mais tarde."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Campanhas Visuais</h2>
          <p className="text-slate-500 font-medium">Controle os destaques da vitrine e agende promoções.</p>
        </div>
        <button 
          disabled={isSubmitting}
          onClick={() => {
            setFormData({ title: '', imageUrl: '', linkType: 'product', targetId: '', status: 'active', startDate: '', endDate: '' });
            setIsModalOpen(true);
          }}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-2xl hover:bg-emerald-500 transition-all disabled:opacity-50"
        >
          + NOVO BANNER
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {banners.map(banner => (
          <div key={banner.id} className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden group">
            <div className="relative aspect-[21/9] overflow-hidden bg-slate-100">
              <img src={banner.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
              <div className="absolute top-6 right-6">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  banner.status === 'active' ? 'bg-emerald-50 text-white shadow-xl shadow-emerald-500/20' : 'bg-slate-200 text-slate-500'
                }`}>
                  {banner.status === 'active' ? 'Ativo' : 'Pausado'}
                </span>
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-xl font-black text-slate-900 mb-2">{banner.title}</h3>
              <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-6 mb-6">
                <span>Estado: Ativo para todos os usuários</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600 uppercase">{banner.linkType}: {banner.targetId || 'Home'}</span>
                </div>
                <button 
                  disabled={isSubmitting}
                  onClick={() => { setFormData(banner); setIsModalOpen(true); }}
                  className="text-xs font-black text-slate-900 hover:text-emerald-500 uppercase tracking-widest disabled:opacity-30"
                >
                  Editar Parâmetros
                </button>
              </div>
            </div>
          </div>
        ))}
        {banners.length === 0 && !isSubmitting && (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold uppercase tracking-widest">Nenhum banner cadastrado no momento.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[50px] shadow-2xl p-10 animate-in zoom-in-95 overflow-y-auto max-h-[90vh]">
            <h3 className="text-2xl font-black mb-8 uppercase tracking-tight">{formData.id ? 'Editar' : 'Configurar'} Banner</h3>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Título Interno</label>
                <input required disabled={isSubmitting} placeholder="Ex: Campanha Whey Isolate 2024" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 outline-none font-bold shadow-inner" />
              </div>
              
              <FileUpload 
                label="Mídia do Banner (Ideal 1920x800)" 
                currentUrl={formData.imageUrl || ''} 
                onUploadComplete={(url) => setFormData({...formData, imageUrl: url})} 
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Tipo de Link</label>
                  <select disabled={isSubmitting} value={formData.linkType} onChange={e => setFormData({...formData, linkType: e.target.value as any})} className="w-full bg-slate-50 rounded-2xl p-5 outline-none font-bold">
                    <option value="product">Produto Específico</option>
                    <option value="category">Categoria Inteira</option>
                    <option value="external">URL Externa</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">ID Alvo / URL</label>
                  <input disabled={isSubmitting} placeholder="ID do item ou link" value={formData.targetId} onChange={e => setFormData({...formData, targetId: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 outline-none font-bold shadow-inner" />
                </div>
              </div>

              <div className="p-6 bg-amber-50 rounded-[24px] border border-amber-100">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Nota do Sistema</p>
                <p className="text-xs text-amber-700 leading-relaxed font-medium">O agendamento por data (Início/Fim) está desativado nesta versão do banco para garantir estabilidade operacional.</p>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={isSubmitting} className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs hover:bg-emerald-500 transition-all disabled:opacity-50 shadow-xl">
                  {isSubmitting ? 'SINCRONIZANDO...' : 'SALVAR NO SUPABASE'}
                </button>
                <button type="button" disabled={isSubmitting} onClick={() => setIsModalOpen(false)} className="px-8 py-5 bg-slate-100 text-slate-500 rounded-2xl font-bold uppercase text-xs">CANCELAR</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingBanners;