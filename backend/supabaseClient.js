import { createClient } from '@supabase/supabase-js';

/**
 * SUPABASE CLIENT - G-FITLIFE
 * Acesso direto para garantir a substituição estática pelo Vite/Define.
 */

// As variáveis abaixo são substituídas em tempo de build pelo Vite.
// Não use encadeamento opcional (?.) aqui, pois isso quebra a substituição literal do bundler.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;

if (typeof window !== 'undefined') {
  if (supabase) {
    try {
      const host = new URL(SUPABASE_URL).hostname;
      console.log(`[GFIT-SYSTEM] Supabase conectado com sucesso em: ${host}`);
    } catch (e) {
      console.log("[GFIT-SYSTEM] Supabase inicializado.");
    }
  } else {
    console.error("[GFIT-ERROR] Credenciais do Supabase ausentes no bundle do cliente.");
    console.warn("[GFIT-TIP] Verifique se VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão configurados corretamente nas variáveis de ambiente do Railway.");
  }
}
