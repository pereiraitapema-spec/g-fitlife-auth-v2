
import { createClient } from '@supabase/supabase-js';

/**
 * GFITLIFE SUPABASE CLIENT - UNIFIED
 * Este arquivo é compartilhado entre o build do Vite e o runtime do Node.js.
 * IMPORTANTE: O Vite exige referências literais a process.env para realizar a substituição no build.
 */

// Tentativa de obter as chaves de ambiente (Vite substituirá as strings literais abaixo)
const sUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const sKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Fallbacks de segurança para garantir que o sistema não fique "OFF" se o Railway não injetar as variáveis no bundle
const fallbackUrl = 'https://uczbvmemoixmannnfvak.supabase.co';
const fallbackKey = 'sb_publishable_JOdFLDToPSEJq3Xjtk9jbg_lZel8OR_';

const supabaseUrl = (sUrl && sUrl !== "") ? sUrl : fallbackUrl;
const supabaseAnonKey = (sKey && sKey !== "") ? sKey : fallbackKey;

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (supabase) {
  try {
    const host = new URL(supabaseUrl).hostname;
    console.log(`[GFIT-SYSTEM] Conexão Supabase Estabelecida em: ${host}`);
  } catch (e) {
    console.log(`[GFIT-SYSTEM] Conexão Supabase Ativa.`);
  }
} else {
  console.error("[GFIT-ERROR] Falha crítica: Credenciais do Supabase não encontradas. Verifique as variáveis de ambiente no Railway.");
}
