import { createClient } from '@supabase/supabase-js';

/**
 * CLIENTE SUPABASE PARA FRONTEND (BROWSER)
 * Regra de Ouro: Utiliza APENAS a Anon Public Key.
 */

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Validação proativa de chaves e segurança de ambiente
const checkKeySecurity = (url, key) => {
  const isMissing = !url || !key;
  const isPlaceholder = 
    url.includes('seu-projeto') || 
    key.includes('sua-chave');

  if (isMissing || isPlaceholder) {
    console.warn('⚠️ G-FitLife: Configuração do Supabase ausente. Operando em modo OFFLINE.');
    return { valid: false };
  }
  
  // Apenas bloqueia se detectarmos explicitamente que a chave ANON é na verdade a SERVICE_ROLE
  const looksLikeServiceKey = key.includes('service_role');
  if (looksLikeServiceKey) {
    console.error('🚨 ERRO CRÍTICO: SUPABASE_SERVICE_ROLE_KEY detectada no frontend. Operação bloqueada por segurança.');
    return { valid: false };
  }

  return { valid: true };
};

const securityStatus = checkKeySecurity(supabaseUrl, supabaseAnonKey);

/**
 * Exporta o cliente apenas se a configuração for válida.
 */
export const supabase = securityStatus.valid 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const getSupabase = () => supabase;