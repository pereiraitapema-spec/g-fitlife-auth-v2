
import React, { useState, useEffect } from 'react';
import { AIChatSession } from '../types';
import { storeService } from '../services/storeService';

const MarketingChatIA: React.FC = () => {
  const [sessions, setSessions] = useState<AIChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<AIChatSession | null>(null);

  useEffect(() => {
    // Adicionado await para carregar as sessões de chat
    const load = async () => {
      setSessions(await storeService.getChatSessions());
    };
    load();
  }, []);

  const handleEscalate = async (id: string) => {
    // Adicionado await para atualizar o status e recarregar dados
    await storeService.updateChatStatus(id, 'escalated');
    setSessions(await storeService.getChatSessions());
    if (selectedSession?.id === id) setSelectedSession({...selectedSession, status: 'escalated'});
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Auditoria de Inteligência</h2>
          <p className="text-slate-500 font-medium">Monitore as conversas da IA com clientes em tempo real.</p>
        </div>
        <div className="flex gap-4">
          <div className="px-6 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm">
            Atendimento Ativo: 100% IA
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Sessões Recentes</p>
          {sessions.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100 text-slate-300 font-black text-xs uppercase tracking-widest">Nenhum chat registrado.</div>
          ) : (
            sessions.map(session => (
              <button 
                key={session.id}
                onClick={() => setSelectedSession(session)}
                className={`w-full p-6 rounded-[32px] border transition-all text-left flex justify-between items-center ${
                  selectedSession?.id === session.id ? 'bg-emerald-500 text-white border-emerald-500 shadow-xl' : 'bg-white border-slate-100 hover:border-emerald-500'
                }`}
              >
                <div>
                  <p className="text-xs font-black truncate max-w-[150px]">{session.customerEmail || 'Visitante Anônimo'}</p>
                  <p className={`text-[10px] font-bold uppercase mt-1 ${selectedSession?.id === session.id ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {session.messages.length} mensagens
                  </p>
                </div>
                {session.status === 'escalated' && <span className="text-lg">🆘</span>}
              </button>
            ))
          )}
        </div>

        <div className="lg:col-span-8">
          {selectedSession ? (
            <div className="bg-white rounded-[50px] border border-slate-100 shadow-2xl h-[700px] flex flex-col overflow-hidden animate-in slide-in-from-right-10">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-black text-slate-900">{selectedSession.customerEmail || 'Visualização de Chat'}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(selectedSession.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-3">
                  {selectedSession.status !== 'escalated' && (
                    <button 
                      onClick={() => handleEscalate(selectedSession.id)}
                      className="px-6 py-3 bg-amber-100 text-amber-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all"
                    >
                      SOLICITAR ESCALAÇÃO
                    </button>
                  )}
                  <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all">ENCERRAR SESSÃO</button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50 custom-scrollbar">
                 {selectedSession.messages.map((msg, i) => (
                   <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-5 rounded-3xl text-sm font-medium ${
                        msg.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'
                      }`}>
                        {msg.text}
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          ) : (
            <div className="h-[700px] bg-slate-50 rounded-[60px] border-4 border-dashed border-white flex flex-col items-center justify-center text-center p-20 animate-in fade-in zoom-in-95">
               <div className="text-7xl mb-10 opacity-40">🤖</div>
               <h3 className="text-2xl font-black text-slate-800 mb-4">Central de Auditoria IA</h3>
               <p className="text-slate-400 font-medium max-w-sm">A G-FitLife utiliza o Gemini 2.5 para suporte. Selecione uma conversa para analisar a precisão e o sentimento do cliente.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketingChatIA;
