import { createClient } from '@supabase/supabase-js';

/**
 * CLIENTE SUPABASE PARA FRONTEND (BROWSER)
 * Utiliza APENAS a Anon Public Key.
 */

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Validação de Segurança: Bloqueia chaves service_role no navegador
if (supabaseAnonKey.includes('service_role')) {
  console.error('🚨 SEGURANÇA: Chave secreta detectada no frontend! O Supabase bloqueou a inicialização para sua proteção.');
}

export const supabase = (supabaseUrl && supabaseAnonKey && !supabaseAnonKey.includes('service_role')) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const getSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase Client indisponível ou configurado com chave inválida no frontend.');
  }
  return supabase;
};