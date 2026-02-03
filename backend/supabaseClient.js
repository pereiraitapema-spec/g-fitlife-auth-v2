import { createClient } from '@supabase/supabase-js';

/**
 * CLIENTE SUPABASE PARA FRONTEND (BROWSER)
 * Configurado via Vite 'define'. 
 * Utiliza apenas a Anon Public Key.
 */

// O Vite substituirá 'process.env.X' pelas strings literais durante o build
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Aguardando configuração do Supabase... Verifique o arquivo .env e o build do Vite.');
}

// Exporta o cliente apenas se as URLs existirem, prevenindo o erro "supabaseUrl is required"
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper para garantir que não chamemos métodos em um cliente nulo
export const getSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase Client não inicializado. Verifique SUPABASE_URL e SUPABASE_ANON_KEY.');
  }
  return supabase;
};