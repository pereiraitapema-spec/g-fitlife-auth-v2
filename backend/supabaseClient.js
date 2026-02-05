import { createClient } from '@supabase/supabase-js';

const getEnv = (key) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return '';
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

let supabaseInstance = null;

if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('seu-projeto-id')) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.warn("[GFIT-SYSTEM] Falha ao inicializar Supabase:", err.message);
  }
} else {
  console.info("[GFIT-SYSTEM] Operando em modo de demonstração OFFLINE (Chaves ausentes).");
}

export const supabase = supabaseInstance;