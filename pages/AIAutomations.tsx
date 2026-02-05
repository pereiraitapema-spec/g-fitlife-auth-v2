
import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { AIAutomationRule } from '../types';

const AIAutomations: React.FC = () => {
  const [rules, setRules] = useState<AIAutomationRule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<AIAutomationRule>>({ name: '', trigger: '', action: '', status: 'active' });

  useEffect(() => {
    const load = async () => {
      setRules(await storeService.getAIAutomations());
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const newRule: AIAutomationRule = {
        id: 'rule-' + Date.now(),
        name: formData.name || '',
        trigger: formData.trigger || '',
        action: formData.action || '',
        status: 'active',
        executionsCount: 0
      };
      await storeService.saveAIAutomation(newRule);
      setRules(await storeService.getAIAutomations());
      setIsModalOpen(false);
      setFormData({ name: '', trigger: '', action: '', status: 'active' });
    } catch (error) {
      console.error("Erro ao salvar regra de IA", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Automações Inteligentes</h2>
          <p className="text-slate-500 font-medium">Configure gatilhos automáticos disparados pelo motor de IA do ecossistema.</p>
        </div>
        <button 
          disabled={isSubmitting}
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-500 transition-all disabled:opacity-50"
        >
          + NOVA REGRA IA
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rules.map(rule => (
          <div key={rule.id} className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6">
                <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse block"></span>
             </div>
             <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl mb-8 group-hover:rotate-12 transition-transform">⚡</div>
             <h3 className="text-xl font-black text-slate-900 mb-2">{rule.name}</h3>
             
             <div className="space-y-4 mb-10 mt-6">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <span>Trigger</span>
                   <span className="text-slate-900">{rule.trigger}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <span>Action</span>
                   <span className="text-emerald-500">{rule.action}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest pt-4 border-t border-slate-50">
                   <span>Execuções (30d)</span>
                   <span className="text-slate-900 font-bold">{rule.executionsCount}</span>
                </div>
             </div>

             <div className="flex gap-3">
                <button disabled={isSubmitting} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-30">Logs Detalhados</button>
                <button disabled={isSubmitting} className="px-6 py-4 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-500 hover:text-white transition-all disabled:opacity-30">🗑️</button>
             </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[50px] shadow-2xl p-10 animate-in zoom-in-95">
            <h3 className="text-2xl font-black mb-8">Criar Gatilho IA</h3>
            <form onSubmit={handleSave} className="space-y-6">
              <input required disabled={isSubmitting} placeholder="Nome da Automação" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 outline-none font-bold" />
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Gatilho (Trigger)</label>
                <select disabled={isSubmitting} value={formData.trigger} onChange={e => setFormData({...formData, trigger: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 outline-none font-bold">
                   <option value="">Selecione...</option>
                   <option value="Lead Capturado">Lead Capturado</option>
                   <option value="Carrinho Abandonado">Carrinho Abandonado</option>
                   <option value="Compra Concluída">Compra Concluída</option>
                   <option value="Estoque Baixo">Estoque Baixo</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Ação IA (Action)</label>
                <input required disabled={isSubmitting} placeholder="Ex: Enviar Cupom 10% WA" value={formData.action} onChange={e => setFormData({...formData, action: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 outline-none font-bold" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={isSubmitting} className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black hover:bg-emerald-500 transition-all disabled:opacity-50">
                  {isSubmitting ? 'ATIVANDO...' : 'ATIVAR REGRA'}
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

export default AIAutomations;
