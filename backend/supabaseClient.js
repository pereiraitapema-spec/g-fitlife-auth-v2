import { createClient } from '@supabase/supabase-js';

/**
 * CLIENTE SUPABASE PARA FRONTEND (BROWSER)
 * Regra de Ouro: Utiliza APENAS a Anon Public Key.
 * As chaves são injetadas via process.env no build do Vite.
 */

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Inicialização direta para evitar conflitos de detecção de segredos no frontend
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const getSupabase = () => supabase;