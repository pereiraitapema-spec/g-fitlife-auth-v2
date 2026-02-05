
import { createClient } from '@supabase/supabase-js';

/**
 * CLIENTE SUPABASE PARA FRONTEND
 * Proteção contra variáveis indefinidas que causam tela branca.
 */

const supabaseUrl = (typeof process !== 'undefined' && process.env?.SUPABASE_URL) || '';
const supabaseAnonKey = (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) || '';

let supabaseInstance = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.error("[SUPABASE-INIT-ERROR]", err);
  }
} else {
  console.warn("[SUPABASE] Variáveis de ambiente ausentes. O sistema funcionará em modo offline.");
}

export const supabase = supabaseInstance;
export const getSupabase = () => supabase;
