import React, { useState } from 'react';
import { supabase } from '../backend/supabaseClient';

interface ResetPasswordPageProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onSuccess, onCancel }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações Obrigatórias
    if (newPassword.length < 8) {
      setError('A nova senha deve ter no mínimo 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem. Digite novamente.');
      return;
    }

    setLoading(true);
    try {
      if (!supabase) throw new Error("Servidor de banco offline.");

      // Ação Supabase: Atualizar credencial do usuário logado via Magic Link
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      
      if (updateError) {
        console.error("PASSWORD_UPDATE_ERROR", updateError);
        setError(updateError.message || 'Falha ao atualizar senha. O link pode ter expirado.');
      } else {
        console.log("PASSWORD_UPDATE_OK");
        alert('Senha atualizada com sucesso! Realize o login novamente com sua nova credencial.');
        onSuccess();
      }
    } catch (err) {
      console.error("PASSWORD_UPDATE_ERROR", err);
      setError('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-slate-900 flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-md bg-white rounded-[60px] p-12 shadow-2xl text-center space-y-8 overflow-hidden relative border-t-8 border-emerald-500">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
        
        <div className="w-20 h-20 bg-emerald-500 rounded-[30px] flex items-center justify-center text-white text-4xl font-black mx-auto shadow-2xl shadow-emerald-500/20">
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

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-2 text-left">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Nova Senha</label>
            <input 
              required
              disabled={loading}
              type="password" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              placeholder="Digite 8 ou mais caracteres" 
              className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-3xl p-6 outline-none font-bold shadow-inner transition-all" 
            />
          </div>

          <div className="space-y-2 text-left">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Confirmar Nova Senha</label>
            <input 
              required
              disabled={loading}
              type="password" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              placeholder="Repita a senha para confirmar" 
              className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-3xl p-6 outline-none font-bold shadow-inner transition-all" 
            />
          </div>

          <div className="pt-4 space-y-4">
            <button 
              disabled={loading}
              type="submit" 
              className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black text-xs uppercase tracking-widest hover:bg-emerald-500 shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ATUALIZANDO...
                </>
              ) : (
                'ATUALIZAR SENHA'
              )}
            </button>
            
            <button 
              type="button"
              disabled={loading}
              onClick={onCancel}
              className="w-full py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
            >
              Cancelar e Sair
            </button>
          </div>
        </form>

        <p className="text-[9px] text-slate-400 font-medium italic">
          Obrigatório preencher a confirmação corretamente para prosseguir.
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;