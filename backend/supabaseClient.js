import { createClient } from '@supabase/supabase-js';

// No Railway ou local (Node), usamos process.env
// Em builds Vite, o processo de substituição pode variar, 
// mas mantemos o padrão solicitado pelo arquiteto.
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
  console.warn('⚠️ AVISO: Variáveis do Supabase não configuradas ou usando placeholders.');
  console.warn('Certifique-se de configurar SUPABASE_URL e SUPABASE_ANON_KEY no painel do Railway.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
