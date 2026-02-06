-- 1. Tabela singular user_profile (Regra suprema)
CREATE TABLE IF NOT EXISTS public.user_profile (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'customer',
    status TEXT DEFAULT 'active',
    login_type TEXT DEFAULT 'hybrid',
    is_default_password BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Configurações Globais
CREATE TABLE IF NOT EXISTS public.core_settings (
    key TEXT PRIMARY KEY,
    nome_loja TEXT DEFAULT 'G-FitLife',
    logo_url TEXT,
    email_contato TEXT,
    telefone TEXT,
    whatsapp TEXT,
    dominio TEXT,
    moeda TEXT DEFAULT 'BRL',
    timezone TEXT DEFAULT 'America/Sao_Paulo',
    company_name TEXT,
    store_name TEXT,
    admin_email TEXT,
    system_status TEXT DEFAULT 'online',
    environment TEXT DEFAULT 'production',
    privacy_policy TEXT,
    terms_of_use TEXT,
    pwa_version TEXT DEFAULT '1.0',
    language TEXT DEFAULT 'pt-BR',
    currency TEXT DEFAULT 'BRL'
);

-- ATIVAÇÃO DE RLS (SEGURANÇA)
ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.core_settings ENABLE ROW LEVEL SECURITY;

-- POLICIES BÁSICAS
CREATE POLICY "Leitura pública de settings" ON public.core_settings FOR SELECT USING (true);
CREATE POLICY "Perfil visível pelo próprio usuário" ON public.user_profile FOR SELECT USING (auth.uid() = id);

-- TRIGGER PARA AUTO-CRIAÇÃO DE PERFIL NO AUTH SIGNUP (SINGULAR user_profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    is_master_email BOOLEAN;
    is_google_auth BOOLEAN;
BEGIN
  is_master_email := (new.email = 'pereira.itapema@gmail.com');
  is_google_auth := (new.raw_app_meta_data->>'provider' = 'google');

  INSERT INTO public.user_profile (id, email, name, role, status, is_default_password)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'Membro G-Fit'), 
    CASE WHEN is_master_email THEN 'admin_master' ELSE 'customer' END, 
    'active',
    CASE WHEN is_google_auth THEN FALSE ELSE is_master_email END -- Exige troca de senha apenas para o master via email/senha inicial
  )
  ON CONFLICT (id) DO UPDATE SET 
    role = CASE WHEN is_master_email THEN 'admin_master' ELSE user_profile.role END,
    is_default_password = EXCLUDED.is_default_password;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- SCRIPT DE GARANTIA: Caso o usuário master já exista no Auth mas não no Profile
-- UPDATE public.user_profile SET role = 'admin_master' WHERE email = 'pereira.itapema@gmail.com';