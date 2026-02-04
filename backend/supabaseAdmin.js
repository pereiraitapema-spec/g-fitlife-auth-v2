
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

/**
 * CLIENTE SUPABASE PARA BACKEND (ADMIN)
 * Utiliza a SERVICE_ROLE_KEY injetada via ENV.
 * Bypassa as regras de RLS (Row Level Security).
 * NUNCA deve ser exposto no frontend.
 */

const supabaseUrl = process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Erro Crítico: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausentes no backend.');
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

module.exports = { supabaseAdmin };
