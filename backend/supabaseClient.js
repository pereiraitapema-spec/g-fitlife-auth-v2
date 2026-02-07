import { createClient } from '@supabase/supabase-js';

/**
 * SUPABASE CLIENT - G-FITLIFE
 * Inicialização otimizada para o ecossistema G-Fit.
 * As variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são injetadas 
 * pelo Vite durante o build (processo de transpilação).
 */

// O Vite substitui estas strings literais pelos valores reais definidos no Railway/Vite Config
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Criação do cliente. Será null se as chaves não forem encontradas após a compilação.
export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;

// Diagnóstico de inicialização para o console do navegador
if (typeof window !== 'undefined') {
  if (supabase) {
    try {
      const url = new URL(SUPABASE_URL);
      console.log(`[GFIT-SYSTEM] Supabase conectado: ${url.hostname}`);
    } catch (e) {
      console.log("[GFIT-SYSTEM] Supabase inicializado com sucesso.");
    }
  } else {
    // Este log indica que o build foi gerado sem os valores de ambiente necessários
    console.error("[GFIT-ERROR] Credenciais do Supabase ausentes no bundle do cliente.");
    console.warn("[GFIT-TIP] Verifique se SUPABASE_URL e SUPABASE_ANON_KEY estão definidas no painel do Railway e reinicie o deploy.");
  }
}