import { createClient } from '@supabase/supabase-js';

/**
 * GFITLIFE SUPABASE CLIENT
 * Configuração unificada para Vite (Browser) e Node.js (Servidor).
 * O Vite substitui as referências a process.env no momento do build através da configuração 'define'.
 */

// Chaves obtidas do ambiente através do padrão process.env injetado pelo Vite ou nativo do Node.
// Incluímos as chaves fornecidas no MASTER PROMPT como fallbacks para garantir a resiliência da infraestrutura.
const supabaseUrl = process.env.SUPABASE_URL || 'https://uczbvmemoixmannnfvak.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_JOdFLDToPSEJq3Xjtk9jbg_lZel8OR_';

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!supabase) {
  console.warn("[GFIT-INFRA] Supabase não pôde ser inicializado. Verifique se as variáveis SUPABASE_URL e SUPABASE_ANON_KEY estão configuradas corretamente.");
} else {
  console.log("[GFIT-SYSTEM] Supabase Cloud Infra Ativa e Sincronizada.");
}
