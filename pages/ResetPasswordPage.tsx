import React, { useState, useEffect } from 'react';
import { supabase } from '../backend/supabaseClient';

interface ResetPasswordPageProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onSuccess, onCancel }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      if (!supabase) {
        setError('Servidor de autenticação offline.');
        setIsValidating(false);
        return;
      }

      // O link do Supabase injeta automaticamente a sessão se o token for válido
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Sessão inválida ou expirada. Por favor, solicite um novo link de recuperação.');
      }
      setIsValidating(false);
    };
    
    checkSession();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Regras de Segurança
    if (newPassword.length < 8) {
      setError('A nova senha deve ter no mínimo 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem. Digite exatamente a mesma senha nos dois campos.');
      return;
    }

    setLoading(true);
    try {
      if (!supabase) throw new Error("Servidor offline.");

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      
      if (updateError) {
        setError(updateError.message || 'Falha ao atualizar senha.');
      } else {
        setSuccessMsg('Sua senha foi atualizada com sucesso! Redirecionando...');
        setTimeout(() => {
          onSuccess();
        }, 2500);
      }
    } catch (err: any) {
      setError('Ocorreu um erro ao processar sua solicitação.');
    } finally {
      setLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-900 flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-md bg-white rounded-[60px] p-12 shadow-2xl text-center space-y-8 overflow-hidden relative border-t-8 border-emerald-500">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
        
        <div className="w-20 h-20 bg-emerald-500 rounded-[30px] flex items-center justify-center text-white text-4xl font-black mx-auto shadow-2xl">
          🔐
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Nova Senha</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Definição de Acesso Seguro</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-100 animate-in slide-in-from-top-2">
            ⚠️ {error}
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 animate-in slide-in-from-top-2">
            ✅ {successMsg}
          </div>
        )}

        {!error || successMsg ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2 text-left">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Nova Senha</label>
              <input 
                required
                disabled={loading || !!successMsg}
                type="password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                placeholder="Mínimo 8 caracteres" 
                className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-3xl p-6 outline-none font-bold shadow-inner transition-all" 
              />
            </div>

            <div className="space-y-2 text-left">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Confirmar Senha</label>
              <input 
                required
                disabled={loading || !!successMsg}
                type="password" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                placeholder="Repita a nova senha" 
                className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-3xl p-6 outline-none font-bold shadow-inner transition-all" 
              />
            </div>

            <div className="pt-4 space-y-4">
              <button 
                disabled={loading || !!successMsg}
                type="submit" 
                className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black text-xs uppercase tracking-widest hover:bg-emerald-500 shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? 'ATUALIZANDO...' : 'SALVAR NOVA SENHA'}
              </button>
            </div>
          </form>
        ) : null}

        {error && !successMsg && (
          <button 
            type="button"
            onClick={onCancel}
            className="w-full py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
          >
            Voltar para o Login
          </button>
        )}

        <p className="text-[9px] text-slate-400 font-medium italic">
          Após salvar, sua sessão anterior será invalidada por segurança.
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;