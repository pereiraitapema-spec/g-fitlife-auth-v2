
import React, { useState, useRef, useEffect } from 'react';
import { getAICoachResponse } from '../services/geminiService';
import { Message } from '../types';

interface AICoachProps {
  isOpen: boolean;
  onClose: () => void;
}

const AICoach: React.FC<AICoachProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Olá! Sou o seu Coach G-FitLife. Como posso ajudar na sua jornada de saúde hoje? Posso sugerir treinos, suplementos ou tirar dúvidas!', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const responseText = await getAICoachResponse(input, history);
    
    setMessages(prev => [...prev, { role: 'model', text: responseText, timestamp: new Date() }]);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10">
        {/* Header */}
        <div className="bg-emerald-600 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">🤖</div>
            <div>
              <h3 className="font-bold text-sm">G-FitLife Coach</h3>
              <p className="text-[10px] text-emerald-100">Inteligência Artificial Ativa</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Chat Body */}
        <div 
          ref={scrollRef}
          className="flex-1 h-[400px] overflow-y-auto p-4 space-y-4 bg-slate-50"
        >
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                m.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 rounded-tl-none">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Input */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Pergunte algo sobre sua dieta ou treino..."
              className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
          <p className="text-[10px] text-center text-slate-400 mt-2 italic">
            Consulte sempre um profissional de saúde qualificado.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AICoach;
