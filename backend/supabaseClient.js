import { createClient } from '@supabase/supabase-js';

/**
 * SUPABASE CLIENT - G-FITLIFE
 * Acesso robusto para garantir substituição pelo Vite Define/Environment.
 */

// Busca as credenciais tentando todas as formas de injeção possíveis no Vite/Node
const SUPABASE_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || 
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) || 
  '';

const SUPABASE_ANON_KEY = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || 
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) || 
  '';

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
    console.warn("[GFIT-TIP] Verifique se VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão no Railway.");
  }
}