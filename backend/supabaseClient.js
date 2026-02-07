import { createClient } from '@supabase/supabase-js';

/**
 * SUPABASE CLIENT - G-FITLIFE
 * Este arquivo centraliza a conexão com o banco de dados.
 * As variáveis devem ser prefixadas com VITE_ para o frontend ou estar no process.env para o backend.
 */

// Acesso direto para permitir substituição estática pelo Vite.
// Não utilize encadeamento opcional ou verificações complexas aqui, 
// pois o Vite precisa identificar a string exata para substituição durante o build.
const url = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) || 
            (typeof process !== 'undefined' && process.env && process.env.VITE_SUPABASE_URL) || 
            (typeof process !== 'undefined' && process.env && process.env.SUPABASE_URL) || 
            '';

const key = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) || 
            (typeof process !== 'undefined' && process.env && process.env.VITE_SUPABASE_ANON_KEY) || 
            (typeof process !== 'undefined' && process.env && process.env.SUPABASE_ANON_KEY) || 
            '';

// Inicializa o cliente apenas se tivermos as credenciais
export const supabase = (url && key) ? createClient(url, key) : null;

// Diagnóstico de conexão (apenas no navegador)
if (typeof window !== 'undefined') {
  if (supabase) {
    console.log("[GFIT-SYSTEM] Supabase inicializado com sucesso.");
  } else {
    console.error("[GFIT-ERROR] Credenciais do Supabase ausentes no bundle do cliente.");
    console.warn("[GFIT-TIP] Certifique-se de que VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão configuradas no ambiente de build do Railway.");
  }
}