import { createClient } from '@supabase/supabase-js';

/**
 * GFITLIFE SUPABASE INFRASTRUCTURE
 * Ação Obrigatória: Leitura exclusiva via import.meta.env (Vite)
 * Validação: Bloqueio total do sistema caso as chaves estejam ausentes.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validação de segurança e infraestrutura
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('seu-projeto-id')) {
  const errorMsg = "CRITICAL INFRASTRUCTURE ERROR: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing. System startup aborted to prevent data loss or inconsistent state.";
  console.error(`[GFIT-SYSTEM-HALT] ${errorMsg}`);
  throw new Error(errorMsg);
}

// Inicialização única e obrigatória
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log("[GFIT-SYSTEM] Supabase Cloud Conectado e Ativo.");
