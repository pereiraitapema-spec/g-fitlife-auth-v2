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
-- Garante que o bucket existe (Executar no SQL Editor do Supabase)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true) ON CONFLICT (id) DO NOTHING;

-- Policy para INSERT: Apenas usuários autenticados (auth.uid() IS NOT NULL)
DO $$ 
BEGIN
    -- Remover antigas para evitar duplicidade
    DELETE FROM storage.policies WHERE name = 'Permitir upload para autenticados';
    DELETE FROM storage.policies WHERE name = 'Acesso público para leitura';
    
    INSERT INTO storage.policies (name, color, definition, check, operation, bucket_id)
    VALUES ('Permitir upload para autenticados', 'emerald', null, '(auth.uid() IS NOT NULL)', 'INSERT', 'uploads');
    
    INSERT INTO storage.policies (name, color, definition, check, operation, bucket_id)
    VALUES ('Acesso público para leitura', 'blue', '(bucket_id = ''uploads'')', null, 'SELECT', 'uploads');
END $$;

-- 5. TRIGGER PARA AUTO-CRIAÇÃO DE PERFIL NO AUTH SIGNUP
-- CORREÇÃO PARA ERRO 500: Usar ON CONFLICT(email) para assumir perfis pré-existentes e SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    is_master_email BOOLEAN;
BEGIN
  is_master_email := (new.email IN ('master@gfitlife.com', 'pereira.itapema@gmail.com'));

  INSERT INTO public.user_profile (id, email, name, role, status, is_default_password)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'Membro G-Fit'), 
    CASE WHEN is_master_email THEN 'admin_master' ELSE 'customer' END, 
    'active',
    CASE WHEN (new.raw_app_meta_data->>'provider' = 'google') THEN FALSE ELSE TRUE END 
  )
  ON CONFLICT (email) DO UPDATE SET 
    id = EXCLUDED.id, -- Sincroniza o ID do Auth com o perfil pre-existente (Fundamental para evitar erro 500)
    name = COALESCE(EXCLUDED.name, user_profile.name),
    role = CASE WHEN is_master_email THEN 'admin_master' ELSE user_profile.role END,
    is_default_password = EXCLUDED.is_default_password;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reiniciar Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Garantir permissões de acesso para o usuário de auth do Supabase
GRANT ALL ON public.user_profile TO postgres, service_role;