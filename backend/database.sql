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

-- 3. Tracking de Links de Afiliados
CREATE TABLE IF NOT EXISTS public.tracking_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    visits INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ATIVAÇÃO DE RLS (SEGURANÇA)
ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.core_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_links ENABLE ROW LEVEL SECURITY;

-- POLICIES BÁSICAS
CREATE POLICY "Leitura pública de settings" ON public.core_settings FOR SELECT USING (true);
CREATE POLICY "Perfil visível pelo próprio usuário" ON public.user_profile FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Afiliados podem ver seus links" ON public.tracking_links FOR SELECT USING (true);
CREATE POLICY "Adição de links livre para admin" ON public.tracking_links FOR ALL USING (true);

-- 4. CONFIGURAÇÃO DE STORAGE (uploads)
-- Certifique-se de criar o bucket 'uploads' no painel antes de aplicar
-- Policy para INSERT: Permitir apenas usuários autenticados
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'uploads') THEN
        INSERT INTO storage.policies (name, color, definition, check, operation, bucket_id)
        VALUES ('Permitir upload para autenticados', 'emerald', null, '(auth.uid() IS NOT NULL)', 'INSERT', 'uploads')
        ON CONFLICT (name) DO NOTHING;
        
        INSERT INTO storage.policies (name, color, definition, check, operation, bucket_id)
        VALUES ('Acesso público para leitura', 'blue', '(bucket_id = ''uploads'')', null, 'SELECT', 'uploads')
        ON CONFLICT (name) DO NOTHING;
    END IF;
END $$;

-- TRIGGER PARA AUTO-CRIAÇÃO DE PERFIL NO AUTH SIGNUP (SINGULAR user_profile)
-- CORREÇÃO: ON CONFLICT (email) para evitar erro 500 se o perfil já existir sem ID de auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    is_master_email BOOLEAN;
    is_google_auth BOOLEAN;
BEGIN
  is_master_email := (new.email IN ('master@gfitlife.com', 'pereira.itapema@gmail.com'));
  is_google_auth := (new.raw_app_meta_data->>'provider' = 'google');

  INSERT INTO public.user_profile (id, email, name, role, status, is_default_password)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'Membro G-Fit'), 
    CASE WHEN is_master_email THEN 'admin_master' ELSE 'customer' END, 
    'active',
    CASE WHEN is_google_auth THEN FALSE ELSE TRUE END 
  )
  ON CONFLICT (email) DO UPDATE SET 
    id = EXCLUDED.id, -- Sincroniza o ID do Auth com o perfil pre-existente
    name = COALESCE(EXCLUDED.name, user_profile.name),
    role = CASE WHEN is_master_email THEN 'admin_master' ELSE user_profile.role END,
    is_default_password = EXCLUDED.is_default_password;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- SEED MASTER INICIAL (Garante o registro base)
-- Em produção, o ID real virá do auth.users via trigger corrigida acima
INSERT INTO public.user_profile (id, email, name, role, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'master@gfitlife.com', 'Admin Master', 'admin_master', 'active')
ON CONFLICT (email) DO NOTHING;