import { createClient } from '@supabase/supabase-js';

/**
 * GFITLIFE SUPABASE CLIENT - UNIFIED INITIALIZATION
 * Este arquivo é compartilhado entre o frontend (Vite) e o backend (Node.js).
 */

// Lógica de captura de variáveis compatível com Vite (Browser) e Node.js (Server)
const getEnv = (key) => {
  // 1. Tenta via import.meta.env (Padrão Vite no Browser)
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
  } catch (e) {}

  // 2. Tenta via process.env (Node.js ou Injeção via Define no Vite)
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {}

  return '';
};

// Captura as chaves priorizando o prefixo VITE_ exigido pelo compilador frontend
const url = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL');
const key = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY');

export const supabase = (url && key) ? createClient(url, key) : null;

// Diagnóstico de inicialização em tempo de execução
if (supabase) {
  const env = typeof window !== 'undefined' ? 'Frontend' : 'Backend';
  try {
    const host = new URL(url).hostname;
    console.log(`[GFIT-SYSTEM] Supabase ativo no ${env}: ${host}`);
  } catch (e) {
    console.log(`[GFIT-SYSTEM] Supabase ativo no ${env}.`);
  }
} else if (typeof window !== 'undefined') {
  // Log de erro crítico específico para o bundle do cliente
  console.error("[GFIT-ERROR] Credenciais do Supabase ausentes no bundle do cliente.");
  console.warn("[GFIT-TIP] Verifique se SUPABASE_URL e SUPABASE_ANON_KEY estão configuradas nas variáveis do Railway.");
  console.warn("[GFIT-TIP] Após configurar, realize um NOVO DEPLOY para que o build do Vite congele os valores no código.");
}