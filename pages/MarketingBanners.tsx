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

  useEffect(() => {
    const load = async () => {
      const data = await storeService.getBanners();
      setBanners(data);
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const newBanner = {
        ...formData,
        id: formData.id || 'BAN-' + Date.now()
      } as Banner;
      await storeService.saveBanner(newBanner);
      const data = await storeService.getBanners();
      setBanners(data);
      setIsModalOpen(false);
      setFormData({ title: '', imageUrl: '', linkType: 'product', targetId: '', status: 'active', startDate: '', endDate: '' });
    } catch (error) {
      console.error("Erro ao salvar banner", error);
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
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-2xl hover:bg-emerald-500 transition-all disabled:opacity-50"
        >
          + NOVO BANNER
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {banners.map(banner => (
          <div key={banner.id} className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden group">
            <div className="relative aspect-[21/9] overflow-hidden bg-slate-100">
              <img src={banner.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
              <div className="absolute top-6 right-6">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  banner.status === 'active' ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' : 'bg-slate-200 text-slate-500'
                }`}>
                  {banner.status === 'active' ? 'Ativo' : 'Pausado'}
                </span>
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-xl font-black text-slate-900 mb-2">{banner.title}</h3>
              <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-6 mb-6">
                <span>Início: {banner.startDate}</span>
                <span>Fim: {banner.endDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600 uppercase">{banner.linkType}: {banner.targetId}</span>
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
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[50px] shadow-2xl p-10 animate-in zoom-in-95">
            <h3 className="text-2xl font-black mb-8">Configurar Banner</h3>
            <form onSubmit={handleSave} className="space-y-6">
              <input required disabled={isSubmitting} placeholder="Título da Campanha" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 outline-none font-bold" />
              
              <FileUpload 
                label="Imagem do Banner" 
                currentUrl={formData.imageUrl || ''} 
                onUploadComplete={(url) => setFormData({...formData, imageUrl: url})} 
              />

              <div className="grid grid-cols-2 gap-4">
                <select disabled={isSubmitting} value={formData.linkType} onChange={e => setFormData({...formData, linkType: e.target.value as any})} className="bg-slate-50 rounded-2xl p-5 outline-none font-bold">
                  <option value="product">Produto</option>
                  <option value="category">Categoria</option>
                  <option value="external">Link Externo</option>
                </select>
                <input disabled={isSubmitting} placeholder="ID Alvo" value={formData.targetId} onChange={e => setFormData({...formData, targetId: e.target.value})} className="bg-slate-50 rounded-2xl p-5 outline-none font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input disabled={isSubmitting} type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="bg-slate-50 rounded-2xl p-5 outline-none font-bold" />
                <input disabled={isSubmitting} type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="bg-slate-50 rounded-2xl p-5 outline-none font-bold" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={isSubmitting} className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black hover:bg-emerald-500 transition-all disabled:opacity-50">
                  {isSubmitting ? 'SINCRONIZANDO...' : 'SALVAR NO BACKEND'}
                </button>
                <button type="button" disabled={isSubmitting} onClick={() => setIsModalOpen(false)} className="px-8 py-5 bg-slate-100 text-slate-500 rounded-2xl font-bold">CANCELAR</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingBanners;