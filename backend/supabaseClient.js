import { createClient } from '@supabase/supabase-js';

/**
 * SUPABASE CLIENT - G-FITLIFE
 * Configuração resiliente para ambientes de produção (Vite/Railway).
 * O acesso deve ser estático para que o compilador substitua os valores durante o build.
 */

// Acesso estático obrigatório para substituição pelo Vite Define/ImportMeta
const SUPABASE_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) || 
  (typeof process !== 'undefined' && process.env && process.env.VITE_SUPABASE_URL) || 
  '';

const SUPABASE_ANON_KEY = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) || 
  (typeof process !== 'undefined' && process.env && process.env.VITE_SUPABASE_ANON_KEY) || 
  '';

// Inicializa o cliente apenas se tivermos as credenciais básicas
export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;

// Diagnóstico de conexão no console do navegador
if (typeof window !== 'undefined') {
  if (supabase) {
    try {
      const host = new URL(SUPABASE_URL).hostname;
      console.log(`[GFIT-SYSTEM] Supabase conectado com sucesso em: ${host}`);
    } catch (e) {
      console.log(`[GFIT-SYSTEM] Supabase inicializado.`);
    }
  } else {
    console.error("[GFIT-ERROR] Credenciais do Supabase ausentes no bundle do cliente.");
    console.warn("[GFIT-TIP] Verifique as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no painel do Railway e execute um novo deploy.");
  }
}