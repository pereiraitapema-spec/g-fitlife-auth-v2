import { createClient } from '@supabase/supabase-js';

/**
 * SUPABASE CLIENT - G-FITLIFE
 * Inicialização otimizada para o ecossistema G-Fit.
 * Projetado para capturar credenciais tanto em ambiente local quanto em deploy Railway.
 */

// Referências diretas para garantir que o Vite consiga realizar a substituição estática
// Prioridade: import.meta.env (Vite) -> process.env (Vite define/Node)
const SUPABASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) || 
                     (typeof process !== 'undefined' && process.env && process.env.VITE_SUPABASE_URL) || 
                     '';

const SUPABASE_ANON_KEY = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) || 
                          (typeof process !== 'undefined' && process.env && process.env.VITE_SUPABASE_ANON_KEY) || 
                          '';

// Criação condicional do cliente para evitar crash em caso de variáveis ausentes
export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;

// Log de diagnóstico silencioso em produção, explicativo em desenvolvimento
if (typeof window !== 'undefined') {
  if (supabase) {
    try {
      const host = new URL(SUPABASE_URL).hostname;
      console.log(`[GFIT-SYSTEM] Supabase sincronizado com: ${host}`);
    } catch (e) {
      console.log("[GFIT-SYSTEM] Supabase inicializado com sucesso.");
    }
  } else {
    console.error("[GFIT-ERROR] Credenciais do Supabase ausentes no bundle do cliente.");
    console.warn("[GFIT-TIP] Certifique-se de configurar as variáveis SUPABASE_URL e SUPABASE_ANON_KEY no painel do Railway e reiniciar o deploy.");
  }
}
