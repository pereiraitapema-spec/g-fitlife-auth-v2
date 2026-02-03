const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

/**
 * CLIENTE SUPABASE PARA BACKEND (ADMIN)
 * Utiliza a SERVICE_ROLE_KEY.
 * Bypassa as regras de RLS (Row Level Security).
 * NUNCA deve ser importado no frontend.
 */

const supabaseUrl = process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Erro: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configuradas no backend.');
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

module.exports = { supabaseAdmin };