
import { createClient } from '@supabase/supabase-js';

/**
 * GFITLIFE SUPABASE CLIENT - UNIFIED
 * Este arquivo é compartilhado entre o build do Vite e o runtime do Node.js.
 */

// 1. Tenta obter via literal process.env (que o Vite substitui no build)
// 2. Tenta obter via objeto process global (se estiver no Node.js)
const getEnv = (key) => {
  try {
    // Se o Vite substituiu, será uma string. Se não, tenta acessar o objeto.
    const val = process.env[key];
    return (val && val !== "") ? val : undefined;
  } catch (e) {
    return undefined;
  }
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY');

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (supabase) {
  try {
    const host = new URL(supabaseUrl).hostname;
    console.log(`[GFIT-SYSTEM] Conexão Supabase Ativa: ${host}`);
  } catch (e) {
    console.log(`[GFIT-SYSTEM] Conexão Supabase Inicializada.`);
  }
} else {
  // Log silencioso no console para depuração, sem travar o carregamento inicial da UI
  console.warn("[GFIT-ERROR] Credenciais do Supabase ausentes. Verifique o painel do Railway.");
}
