import { createClient } from '@supabase/supabase-js';

/**
 * GFITLIFE SUPABASE CLIENT - PRODUCTION READY
 * Este arquivo é compartilhado entre o frontend (Vite) e o backend (Node.js).
 * O Vite substitui referências literais a 'process.env.VITE_...' por strings durante o build.
 */

// Acesso simplificado para garantir a substituição estática do Vite no frontend
// e o acesso direto ao process.env no backend (Node.js).
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (supabase) {
  try {
    const host = new URL(supabaseUrl).hostname;
    console.log(`[GFIT-SYSTEM] Supabase inicializado: ${host}`);
  } catch (e) {
    console.log(`[GFIT-SYSTEM] Supabase inicializado.`);
  }
} else {
  // Log de erro crítico para diagnóstico no painel do Railway
  console.error("[GFIT-ERROR] Credenciais do Supabase ausentes no bundle do cliente.");
  console.warn("[GFIT-TIP] Certifique-se de que VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão configuradas no Railway.");
}