import { createClient } from '@supabase/supabase-js';

/**
 * SUPABASE CLIENT - G-FITLIFE
 * O Vite exige referências estáticas a import.meta.env para substituição no bundle.
 */

const url = import.meta.env.VITE_SUPABASE_URL || '';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Inicializa o cliente apenas se tivermos as credenciais
export const supabase = (url && key) ? createClient(url, key) : null;

// Diagnóstico de conexão (apenas no navegador)
if (typeof window !== 'undefined') {
  if (supabase) {
    console.log("[GFIT-SYSTEM] Supabase inicializado com sucesso.");
  } else {
    console.error("[GFIT-ERROR] Credenciais do Supabase ausentes no bundle do cliente.");
    console.warn("[GFIT-TIP] Verifique se VITE_SUPABASE_URL está nas variáveis do Railway.");
  }
}