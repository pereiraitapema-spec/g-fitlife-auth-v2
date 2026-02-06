-- 1. Tabela singular user_profile (Fonte de Verdade)
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

-- ATIVAÇÃO DE RLS
ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.core_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_links ENABLE ROW LEVEL SECURITY;

-- POLICIES BÁSICAS
CREATE POLICY "Leitura pública de settings" ON public.core_settings FOR SELECT USING (true);
CREATE POLICY "Perfil visível pelo próprio usuário" ON public.user_profile FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Afiliados podem ver seus links" ON public.tracking_links FOR SELECT USING (true);
CREATE POLICY "Adição de links livre para admin" ON public.tracking_links FOR ALL USING (true);

-- 4. TRIGGER DEFINITIVA PARA AUTO-CRIAÇÃO E RECUPERAÇÃO DE ACESSO MASTER
-- CORREÇÃO: Usa coluna 'name' (correto) em vez de 'full_name' (errado).
-- CORREÇÃO: Promove automaticamente o dono do sistema a admin_master.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. Tentar atualizar um perfil existente que tenha o mesmo e-mail mas ID diferente
  -- IMPORTANTE: Se o e-mail for o seu, garantimos que o cargo seja admin_master
  UPDATE public.user_profile
  SET id = NEW.id,
      name = COALESCE(NEW.raw_user_meta_data->>'full_name', name, 'Membro G-Fit'),
      role = CASE 
        WHEN (NEW.email IN ('master@gfitlife.com', 'pereira.itapema@gmail.com')) THEN 'admin_master' 
        ELSE role 
      END
  WHERE email = NEW.email;

  -- 2. Se nenhum perfil foi atualizado (usuário novo), insere um novo
  IF NOT FOUND THEN
    INSERT INTO public.user_profile (id, email, name, role, status, is_default_password)
    VALUES (
      NEW.id, 
      NEW.email, 
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Membro G-Fit'), 
      CASE 
        WHEN (NEW.email IN ('master@gfitlife.com', 'pereira.itapema@gmail.com')) THEN 'admin_master' 
        ELSE 'customer' 
      END, 
      'active',
      FALSE
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Reiniciar Trigger
DROP TRIGGER IF EXISTS sync_user_profile ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Garantir que o bucket uploads seja acessível
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'uploads') THEN
        DELETE FROM storage.policies WHERE bucket_id = 'uploads';
        
        INSERT INTO storage.policies (name, color, definition, check, operation, bucket_id)
        VALUES ('Permitir upload para autenticados', 'emerald', null, '(auth.uid() IS NOT NULL)', 'INSERT', 'uploads');
        
        INSERT INTO storage.policies (name, color, definition, check, operation, bucket_id)
        VALUES ('Acesso público para leitura', 'blue', '(bucket_id = ''uploads'')', null, 'SELECT', 'uploads');
    END IF;
END $$;