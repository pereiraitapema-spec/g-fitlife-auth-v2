
import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { PWANotification } from '../types';

const PWANotifications: React.FC = () => {
  const [logs, setLogs] = useState<PWANotification[]>([]);
  const [formData, setFormData] = useState({ title: '', body: '' });
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    setLogs(storeService.getPWANotifications());
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
       storeService.sendPWANotification(formData.title, formData.body);
       setLogs(storeService.getPWANotifications());
       setFormData({ title: '', body: '' });
       setIsSending(false);
       alert('Notificação enviada para todos os Apps instalados!');
    }, 2000);
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Push Marketing</h2>
          <p className="text-slate-500 font-medium">Envie avisos em tempo real diretamente para a tela de bloqueio do usuário.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5">
           <div className="bg-slate-900 rounded-[50px] p-10 text-white shadow-2xl space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <h3 className="text-xl font-black tracking-tight">Nova Campanha Push</h3>
              <form onSubmit={handleSend} className="space-y-6">
                 <input required placeholder="Título Chamativo" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none font-bold text-white focus:border-emerald-500 transition-all" />
                 <textarea required placeholder="Mensagem da Notificação..." value={formData.body} onChange={e => setFormData({...formData, body: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none font-bold text-white h-32 focus:border-emerald-500 transition-all" />
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Alcance Estimado</p>
                    <p className="text-emerald-500 font-black text-xl">124 Dispositivos</p>
                 </div>
                 <button 
                  disabled={isSending}
                  type="submit"
                  className="w-full py-6 bg-emerald-500 text-white rounded-[30px] font-black text-sm uppercase tracking-widest shadow-xl hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50"
                 >
                   {isSending ? 'DISPARANDO CLUSTER...' : 'ENVIAR AGORA'}
                 </button>
              </form>
           </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Histórico de Disparos</p>
           {logs.map(log => (
              <div key={log.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex justify-between items-center group hover:border-emerald-500 transition-all">
                 <div className="flex-1">
                    <h4 className="font-black text-slate-900 text-sm mb-1">{log.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1">{log.body}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-3">{new Date(log.sentAt).toLocaleString()} • {log.deliveredCount} entregues</p>
                 </div>
                 <div className="text-emerald-500 text-2xl group-hover:scale-125 transition-transform">🔔</div>
              </div>
           ))}
           {logs.length === 0 && (
              <div className="p-20 text-center bg-slate-50 rounded-[50px] border-4 border-dashed border-white grayscale opacity-40 flex flex-col items-center">
                 <div className="text-6xl mb-4">📭</div>
                 <p className="font-black uppercase tracking-widest text-[10px]">Nenhuma notificação enviada ainda.</p>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default PWANotifications;
