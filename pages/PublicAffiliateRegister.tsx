import React, { useState } from 'react';
import { storeService } from '../services/storeService';

interface PublicAffiliateRegisterProps {
  onComplete: () => void;
}

const PublicAffiliateRegister: React.FC<PublicAffiliateRegisterProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState({ name: '', email: '', reason: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await storeService.registerAffiliate(formData);
      setSuccess(true);
    } catch (err) {
      alert('Falha ao registrar solicitação. Tente novamente mais tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="py-20 text-center space-y-10 animate-in zoom-in-95">
         <div className="w-32 h-32 bg-emerald-500 text-white rounded-[50px] flex items-center justify-center text-6xl mx-auto shadow-2xl">🤝</div>
         <div className="space-y-4">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Solicitação Enviada!</h2>
            <p className="text-slate-500 text-lg font-medium max-w-sm mx-auto">Nossa equipe Master analisará seu perfil. Você receberá um e-mail assim que seu acesso e link de vendas forem liberados.</p>
         </div>
         <button onClick={onComplete} className="px-12 py-5 bg-slate-900 text-white rounded-[30px] font-black uppercase text-xs tracking-widest shadow-xl">VOLTAR PARA A LOJA</button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 max-w-5xl mx-auto py-12 px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
         <div className="space-y-10">
            <div className="space-y-4">
               <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Seja um Parceiro <span className="text-emerald-500">G-FitLife</span></h2>
               <p className="text-slate-500 text-lg font-medium leading-relaxed">Lucre ajudando outras pessoas a alcançarem sua melhor performance. Comissões agressivas e tecnologia de rastreio por IA.</p>
            </div>
            
            <div className="space-y-8 pt-8 border-t border-slate-100">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center text-2xl font-black shadow-sm">15%</div>
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Comissão Base</p>
                     <p className="font-bold text-slate-800 text-sm">A maior taxa do mercado fitness.</p>
                  </div>
               </div>
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl shadow-xl">🔗</div>
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Link Exclusivo</p>
                     <p className="font-bold text-slate-800 text-sm">Dashboard de vendas em tempo real.</p>
                  </div>
               </div>
            </div>
         </div>

         <div className="bg-white p-12 rounded-[60px] border border-slate-100 shadow-2xl space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <h3 className="text-2xl font-black text-slate-900">Formulário de Candidatura</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
               <input required placeholder="Nome Completo" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 rounded-3xl p-6 outline-none font-bold focus:ring-2 focus:ring-emerald-500 transition-all" />
               <input required type="email" placeholder="E-mail para Acesso" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 rounded-3xl p-6 outline-none font-bold focus:ring-2 focus:ring-emerald-500 transition-all" />
               <textarea required placeholder="Como você pretende divulgar nossos produtos?" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full bg-slate-50 rounded-3xl p-6 outline-none font-bold h-32 focus:ring-2 focus:ring-emerald-500 transition-all" />
               
               <button 
                  disabled={isSubmitting}
                  type="submit" 
                  className="w-full py-6 bg-slate-900 text-white rounded-[30px] font-black text-sm uppercase tracking-widest shadow-xl hover:bg-emerald-500 transition-all active:scale-95 disabled:opacity-50"
               >
                  {isSubmitting ? 'ENVIANDO SOLICITAÇÃO...' : 'ENVIAR CANDIDATURA'}
               </button>
            </form>
         </div>
      </div>
    </div>
  );
};

export default PublicAffiliateRegister;