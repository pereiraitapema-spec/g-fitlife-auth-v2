
import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { WhatsAppMessage } from '../types';

const IntegrationWhatsApp: React.FC = () => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [formData, setFormData] = useState({ email: '', content: '' });
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    setMessages(storeService.getWAMessages());
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
       storeService.sendWAMessage(formData.email, formData.content, 'manual');
       setMessages(storeService.getWAMessages());
       setFormData({ email: '', content: '' });
       setIsSending(false);
       alert('Mensagem enviada para a fila de processamento do WhatsApp!');
    }, 1500);
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">WhatsApp Business API</h2>
          <p className="text-slate-500 font-medium">Automação de mensagens transacionais e marketing via chat.</p>
        </div>
        <div className="px-6 py-3 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">
           WA Gateway: Ativo
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5">
           <div className="bg-slate-900 rounded-[50px] p-10 text-white shadow-2xl space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <h3 className="text-xl font-black tracking-tight">Disparo Manual</h3>
              <form onSubmit={handleSend} className="space-y-6">
                 <input required placeholder="E-mail do Cliente" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none font-bold text-white" />
                 <textarea required placeholder="Conteúdo da Mensagem..." value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none font-bold text-white h-32" />
                 <button 
                  disabled={isSending}
                  type="submit"
                  className="w-full py-6 bg-emerald-500 text-white rounded-[30px] font-black text-sm uppercase tracking-widest shadow-xl hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50"
                 >
                   {isSending ? 'DISPARANDO API...' : 'ENVIAR WHATSAPP'}
                 </button>
              </form>
           </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Histórico de Mensagens</p>
           <div className="max-h-[600px] overflow-y-auto custom-scrollbar space-y-3">
              {messages.map(msg => (
                 <div key={msg.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center text-xl">💬</div>
                       <div>
                          <p className="font-black text-slate-800 text-sm line-clamp-1">{msg.content}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{msg.userEmail} • {msg.trigger}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] font-black text-emerald-500 uppercase">Enviada</span>
                       <p className="text-[9px] text-slate-400 font-bold mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                    </div>
                 </div>
              ))}
              {messages.length === 0 && (
                 <div className="p-20 text-center bg-slate-50 rounded-[40px] border-4 border-dashed border-white flex flex-col items-center grayscale opacity-40">
                    <div className="text-5xl mb-4">📭</div>
                    <p className="font-black uppercase tracking-widest text-[10px]">Sem mensagens enviadas.</p>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationWhatsApp;
