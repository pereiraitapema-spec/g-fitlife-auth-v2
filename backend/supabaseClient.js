import { createClient } from '@supabase/supabase-js';

/**
 * CLIENTE SUPABASE PARA FRONTEND (BROWSER)
 * Regra de Ouro: Utiliza APENAS a Anon Public Key.
 */

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Validação proativa de chaves e segurança de ambiente
const checkKeySecurity = (url, key) => {
  // 1. Verificação de Ausência ou Placeholders (Modo Demo)
  const isMissing = !url || !key;
  const isPlaceholder = 
    url.includes('seu-projeto') || 
    url.includes('seu-projeto-id') ||
    key.includes('sua-chave') || 
    key.includes('anon-publica');

  if (isMissing || isPlaceholder) {
    console.warn('⚠️ G-FitLife: Configuração do Supabase ausente ou usando placeholders. O sistema operará em modo DEMO (Offline/Local).');
    return { valid: false, critical: false };
  }
  
  // 2. Verificação Crítica: Service Role no Frontend
  // Nunca deve haver chaves de serviço no define do Vite/Webpack
  const serviceRoleLeaked = 
    key.toLowerCase().includes('service_role') || 
    (typeof process.env.SUPABASE_SERVICE_ROLE_KEY !== 'undefined' && process.env.SUPABASE_SERVICE_ROLE_KEY !== '');

  if (serviceRoleLeaked) {
    console.error('🚨 SEGURANÇA CRÍTICA: SUPABASE_SERVICE_ROLE_KEY detectada no frontend! O acesso foi bloqueado para proteger a integridade do seu banco de dados.');
    return { valid: false, critical: true };
  }

  return { valid: true, critical: false };
};

const securityStatus = checkKeySecurity(supabaseUrl, supabaseAnonKey);

/**
 * Exporta o cliente apenas se a configuração for válida e segura.
 * Caso contrário, exporta null para sinalizar modo Offline/Demo às stores.
 */
export const supabase = securityStatus.valid 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Helper para obter a instância com tratamento de erros de segurança.
 */
export const getSupabase = () => {
  if (!supabase) {
    if (securityStatus.critical) {
      throw new Error('Segurança: Chave Service Role proibida no navegador. Operação abortada.');
    }
    return null; // Retorna null para sinalizar modo Offline amigável
  }
  return supabase;
};