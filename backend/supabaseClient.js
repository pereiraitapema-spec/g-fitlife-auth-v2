import { createClient } from '@supabase/supabase-js';

const getEnv = (key) => {
  // Prioridade 1: Injeção direta via Define do Vite (Client-side bundle)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  // Prioridade 2: Variáveis de ambiente do Node (Server-side/Build time)
  if (import.meta.env && import.meta.env[`VITE_${key}`]) {
    return import.meta.env[`VITE_${key}`];
  }
  // Prioridade 3: Variáveis sem prefixo no import.meta.env
  if (import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  return '';
};

const supabaseUrl = getEnv('SUPABASE_URL') || getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY') || getEnv('VITE_SUPABASE_ANON_KEY');

let supabaseInstance = null;

if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('seu-projeto-id')) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    console.log("[GFIT-SYSTEM] Supabase Cloud Conectado.");
  } catch (err) {
    console.error("[GFIT-SYSTEM] Erro ao instanciar Supabase:", err.message);
  }
} else {
  console.warn("[GFIT-SYSTEM] ALERTA: Chaves do Supabase não configuradas ou inválidas.");
}

export const supabase = supabaseInstance;