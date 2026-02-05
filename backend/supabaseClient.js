import { createClient } from '@supabase/supabase-js';

/**
 * CLIENTE SUPABASE PARA FRONTEND
 * Configuração resiliente para evitar tela branca.
 */

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

let supabaseInstance = null;

if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://seu-projeto-id.supabase.co') {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    console.log("[GFIT-SYSTEM] Supabase Cloud Conectado.");
  } catch (err) {
    console.error("[GFIT-SYSTEM] Erro ao instanciar Supabase:", err);
  }
} else {
  console.warn("[GFIT-SYSTEM] Ambiente operando em modo OFFLINE. Configure SUPABASE_URL e SUPABASE_ANON_KEY.");
}

export const supabase = supabaseInstance;
export const getSupabase = () => supabase;