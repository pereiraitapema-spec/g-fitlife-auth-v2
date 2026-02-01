
import React, { useState } from 'react';

const PublicContact: React.FC = () => {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  if (sent) {
    return (
      <div className="py-24 text-center space-y-8 animate-in zoom-in-95">
         <div className="w-32 h-32 bg-emerald-500 text-white rounded-[40px] flex items-center justify-center text-6xl mx-auto shadow-2xl">✉️</div>
         <h2 className="text-4xl font-black text-slate-900">Mensagem Enviada!</h2>
         <p className="text-slate-500 text-lg max-w-sm mx-auto">Nossa equipe responderá sua solicitação em até 24h úteis.</p>
         <button onClick={() => window.location.reload()} className="px-12 py-5 bg-slate-900 text-white rounded-[30px] font-black uppercase tracking-widest text-xs">Voltar</button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 max-w-5xl mx-auto py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
         <div className="space-y-10">
            <div className="space-y-4">
               <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Fale com a <span className="text-emerald-500">G-FitLife</span></h2>
               <p className="text-slate-500 text-lg font-medium leading-relaxed">Dúvidas sobre suplementação ou seu pedido? Estamos prontos para ajudar.</p>
            </div>
            
            <div className="space-y-8 pt-8 border-t border-slate-100">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl shadow-xl">📍</div>
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nosso Hub</p>
                     <p className="font-bold text-slate-800 text-sm">Av. da Saúde, 1000 - G-Labs Tower</p>
                  </div>
               </div>
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-2xl shadow-xl">💬</div>
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">WhatsApp</p>
                     <p className="font-bold text-slate-800 text-sm">+55 11 99999-9999</p>
                  </div>
               </div>
            </div>
         </div>

         <div className="bg-white p-12 rounded-[60px] border border-slate-100 shadow-2xl space-y-8">
            <h3 className="text-2xl font-black text-slate-900">Mande sua dúvida</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
               <input required placeholder="Seu Nome" className="w-full bg-slate-50 rounded-3xl p-6 outline-none font-bold focus:ring-2 focus:ring-emerald-500 transition-all" />
               <input required type="email" placeholder="Seu melhor e-mail" className="w-full bg-slate-50 rounded-3xl p-6 outline-none font-bold focus:ring-2 focus:ring-emerald-500 transition-all" />
               <textarea required placeholder="Como podemos te ajudar?" className="w-full bg-slate-50 rounded-3xl p-6 outline-none font-bold h-40 focus:ring-2 focus:ring-emerald-500 transition-all" />
               <button type="submit" className="w-full py-6 bg-slate-900 text-white rounded-[30px] font-black text-sm uppercase tracking-widest shadow-xl hover:bg-emerald-500 transition-all active:scale-95">ENVIAR AGORA</button>
            </form>
         </div>
      </div>
    </div>
  );
};

export default PublicContact;
