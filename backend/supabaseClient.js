import { createClient } from '@supabase/supabase-js';

/**
 * SUPABASE CLIENT - G-FITLIFE
 * O Arquiteto configurou este cliente para ser resiliente.
 * Ele tenta ler as credenciais de múltiplas fontes injetadas pelo Vite.
 */

// Tenta obter de import.meta.env ou process.env (injetado via define no vite.config.ts)
const getEnv = (key) => {
  try {
    // @ts-ignore
    return import.meta.env[key] || process.env[key] || '';
  } catch (e) {
    // @ts-ignore
    return (typeof process !== 'undefined' ? process.env[key] : '') || '';
  }
};

const url = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL');
const key = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY');

// Inicializa o cliente apenas se tivermos as credenciais básicas
export const supabase = (url && key) ? createClient(url, key) : null;

// Diagnóstico de conexão (exclusivo para o navegador para não poluir logs de servidor)
if (typeof window !== 'undefined') {
  if (supabase) {
    console.log("[GFIT-SYSTEM] Supabase conectado ao host: " + new URL(url).hostname);
  } else {
    console.error("[GFIT-ERROR] Credenciais do Supabase ausentes no bundle do cliente.");
    console.warn("[GFIT-TIP] 1. Verifique se VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão nas variáveis do Railway.");
    console.warn("[GFIT-TIP] 2. Certifique-se de executar 'npm run build' para processar as variáveis.");
  }
}