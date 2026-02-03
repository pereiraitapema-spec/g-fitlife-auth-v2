import { createClient } from '@supabase/supabase-js';

/**
 * CLIENTE SUPABASE PARA FRONTEND (BROWSER)
 * Regra de Ouro: Utiliza APENAS a Anon Public Key.
 */

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Validação proativa de chaves sensíveis
const checkKeySecurity = (url, key) => {
  if (!url || !key || url.includes('seu-projeto') || key.includes('sua-chave')) {
    console.warn('⚠️ G-FitLife: Configuração do Supabase ausente ou usando placeholders. O sistema operará em modo DEMO (Offline/Local).');
    return { valid: false, critical: false };
  }
  
  if (key.includes('service_role')) {
    console.error('🚨 SEGURANÇA CRÍTICA: SERVICE_ROLE_KEY detectada no frontend! O acesso foi bloqueado para proteger seu banco de dados.');
    return { valid: false, critical: true };
  }

  return { valid: true, critical: false };
};

const securityStatus = checkKeySecurity(supabaseUrl, supabaseAnonKey);

// Exporta o cliente apenas se a chave for válida e segura
export const supabase = securityStatus.valid 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const getSupabase = () => {
  if (!supabase) {
    if (securityStatus.critical) {
      throw new Error('Segurança: Chave Service Role proibida no navegador.');
    }
    return null; // Retorna null para sinalizar modo Offline
  }
  return supabase;
};