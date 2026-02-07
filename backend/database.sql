-- 1. Tabela singular user_profile (Fonte de Verdade)
CREATE TABLE IF NOT EXISTS public.user_profile (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'customer',
    status TEXT DEFAULT 'active',
    login_type TEXT DEFAULT 'hybrid',
    is_default_password BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
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

-- ATIVAÇÃO DE RLS
ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.core_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_links ENABLE ROW LEVEL SECURITY;

-- POLICIES CORRIGIDAS (Remoção de recursão infinita)

-- Configurações: Leitura pública, Escrita apenas para Admins Master via JWT
DROP POLICY IF EXISTS "Leitura pública de settings" ON public.core_settings;
CREATE POLICY "Leitura pública de settings" ON public.core_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins podem gerir settings" ON public.core_settings;
CREATE POLICY "Admins podem gerir settings" ON public.core_settings 
FOR ALL TO authenticated 
USING ( (auth.jwt() ->> 'email') IN ('master@gfitlife.com', 'pereira.itapema@gmail.com') );

-- Perfis: Usuário vê o próprio, Master vê todos via JWT para evitar loop
DROP POLICY IF EXISTS "Perfil visível pelo próprio usuário" ON public.user_profile;
CREATE POLICY "Perfil visível pelo próprio usuário" ON public.user_profile 
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins gerem todos os perfis" ON public.user_profile;
CREATE POLICY "Admins gerem todos os perfis" ON public.user_profile 
FOR ALL TO authenticated 
USING ( (auth.jwt() ->> 'email') IN ('master@gfitlife.com', 'pereira.itapema@gmail.com') );

-- Links de Afiliados
DROP POLICY IF EXISTS "Afiliados podem ver seus links" ON public.tracking_links;
CREATE POLICY "Afiliados podem ver seus links" ON public.tracking_links FOR SELECT USING (true);

DROP POLICY IF EXISTS "Adição de links livre para admin" ON public.tracking_links;
CREATE POLICY "Adição de links livre para admin" ON public.tracking_links FOR ALL USING ( (auth.jwt() ->> 'email') IN ('master@gfitlife.com', 'pereira.itapema@gmail.com') );

-- 4. TRIGGER DE SINCRONIZAÇÃO DE PERFIL
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profile (id, email, name, role, status, is_default_password, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Membro G-Fit'),
    CASE 
      WHEN (NEW.email IN ('master@gfitlife.com', 'pereira.itapema@gmail.com')) THEN 'admin_master' 
      ELSE 'customer' 
    END,
    'active',
    FALSE,
    now(),
    now()
  )
  ON CONFLICT (email) DO UPDATE
  SET id = EXCLUDED.id,
      name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', public.user_profile.name),
      updated_at = now(),
      role = CASE 
        WHEN (NEW.email IN ('master@gfitlife.com', 'pereira.itapema@gmail.com')) THEN 'admin_master' 
        ELSE public.user_profile.role 
      END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger no auth.users
DROP TRIGGER IF EXISTS sync_user_profile ON auth.users;
CREATE TRIGGER sync_user_profile
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Garantir que o bucket uploads exista
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Permitir upload para autenticados" ON storage.objects;
CREATE POLICY "Permitir upload para autenticados" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Acesso público para leitura" ON storage.objects;
CREATE POLICY "Acesso público para leitura" ON storage.objects
FOR SELECT USING (bucket_id = 'uploads');