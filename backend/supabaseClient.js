
import { createClient } from '@supabase/supabase-js';

/**
 * GFITLIFE SUPABASE CLIENT - UNIFIED
 * Este arquivo é compartilhado entre o build do Vite e o runtime do Node.js.
 */

// No navegador, as variáveis são substituídas pelo Vite através do 'define' no vite.config.ts
// No Node.js, elas vêm do process.env real.
// Usamos uma verificação segura para evitar "ReferenceError: process is not defined" no browser.

const getEnv = (key) => {
  try {
    // Tenta acessar via process.env (substituído pelo Vite no build ou nativo no Node)
    return process.env[key];
  } catch (e) {
    return "";
  }
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("[GFIT-ERROR] Credenciais do Supabase ausentes no ambiente atual.");
}

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (supabase) {
  const host = new URL(supabaseUrl).hostname;
  console.log(`[GFIT-SYSTEM] Conexão Supabase Estabelecida: ${host}`);
}
