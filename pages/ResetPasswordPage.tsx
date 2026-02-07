
import React, { useState, useEffect } from 'react';
import { supabase } from '../backend/supabaseClient';
import { storeService } from '../services/storeService';

interface ResetPasswordPageProps {
  onSuccess: () => void;
  onCancel: () => void;
  triggerFeedback?: (msg: string, type: 'success' | 'error' | 'warning') => void;
}

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onSuccess, onCancel, triggerFeedback }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      if (!supabase) {
        setError('Servidor de autenticação offline.');
        setIsValidating(false);
        return;
      }

      // O link do Supabase injeta automaticamente a sessão via fragmento na URL
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Sessão inválida ou expirada. Por favor, solicite um novo link de recuperação no painel de login.');
        if (triggerFeedback) triggerFeedback('Link de recuperação expirado.', 'error');
      }
      setIsValidating(false);
    };
    
    checkSession();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Regras de Segurança Requeridas
    if (newPassword.length < 8) {
      const msg = 'A nova senha deve ter no mínimo 8 caracteres.';
      setError(msg);
      if (triggerFeedback) triggerFeedback(msg, 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      const msg = 'As senhas não coincidem. Repita a senha corretamente.';
      setError(msg);
      if (triggerFeedback) triggerFeedback(msg, 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await storeService.updatePassword(newPassword);
      
      if (res.success) {
        if (triggerFeedback) triggerFeedback('Senha redefinida com sucesso!', 'success');
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setError(res.error || 'Falha ao atualizar senha.');
        if (triggerFeedback) triggerFeedback(res.error || 'Erro no servidor.', 'error');
      }
    } catch (err: any) {
      setError('Ocorreu um erro crítico ao processar sua solicitação.');
    } finally {
      setLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
           <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
           <p className="text-emerald-500 font-black text-xs uppercase tracking-[0.4em]">Validando Token G-Fit...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-900 flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-md bg-white rounded-[60px] p-12 shadow-2xl text-center space-y-10 overflow-hidden relative border-t-[12px] border-emerald-500">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-[80px] -mr-24 -mt-24"></div>
        
        <div className="w-24 h-24 bg-slate-900 rounded-[40px] flex items-center justify-center text-white text-4xl font-black mx-auto shadow-2xl relative group overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <span className="relative z-10">🔐</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight leading-none">Nova Senha</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">G-FitLife Security Center</p>
        </div>

        {error ? (
          <div className="space-y-8 animate-in zoom-in-95">
            <div className="p-6 bg-red-50 text-red-600 rounded-[32px] text-[11px] font-black uppercase tracking-widest border border-red-100 leading-relaxed shadow-sm">
              ⚠️ {error}
            </div>
            <button 
              onClick={onCancel}
              className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-emerald-500 transition-all active:scale-95"
            >
              Voltar ao Início
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Defina a Nova Senha</label>
              <input 
                required
                disabled={loading}
                type="password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                placeholder="Mínimo 8 caracteres" 
                className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-[32px] p-7 outline-none font-bold shadow-inner transition-all text-slate-800 placeholder:text-slate-300" 
              />
            </div>

            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Confirme a Senha</label>
              <input 
                required
                disabled={loading}
                type="password" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                placeholder="Repita a nova senha" 
                className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-[32px] p-7 outline-none font-bold shadow-inner transition-all text-slate-800 placeholder:text-slate-300" 
              />
            </div>

            <div className="pt-6">
              <button 
                disabled={loading}
                type="submit" 
                className="w-full py-7 bg-slate-900 text-white rounded-[32px] font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-emerald-500 hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    SINCRONIZANDO...
                  </>
                ) : (
                  <>
                    SALVAR ACESSO SEGURO
                    <span className="text-xl">→</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest opacity-60">
              Sua sessão anterior será encerrada por segurança.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
