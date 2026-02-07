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

-- 3. Tabela de Produtos (Ajustada para incluir brand)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT,
    price NUMERIC NOT NULL,
    original_price NUMERIC,
    category TEXT,
    image TEXT,
    rating NUMERIC DEFAULT 5,
    reviews INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    description TEXT,
    is_affiliate BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active',
    department_id TEXT,
    category_id TEXT,
    seller_id TEXT,
    seo JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Pedidos
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]',
    total NUMERIC NOT NULL,
    discount NUMERIC DEFAULT 0,
    final_total NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending',
    coupon_code TEXT,
    affiliate_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tracking de Links de Afiliados
CREATE TABLE IF NOT EXISTS public.tracking_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    visits INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ATIVAÇÃO DE RLS E POLÍTICAS
ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.core_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_links ENABLE ROW LEVEL SECURITY;

-- POLICIES (Evita recursão)
DROP POLICY IF EXISTS "Leitura pública de settings" ON public.core_settings;
CREATE POLICY "Leitura pública de settings" ON public.core_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins podem gerir settings" ON public.core_settings;
CREATE POLICY "Admins podem gerir settings" ON public.core_settings FOR ALL TO authenticated USING ( (auth.jwt() ->> 'email') IN ('master@gfitlife.com', 'pereira.itapema@gmail.com') );

DROP POLICY IF EXISTS "Produtos visíveis para todos" ON public.products;
CREATE POLICY "Produtos visíveis para todos" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins gerem produtos" ON public.products;
CREATE POLICY "Admins gerem produtos" ON public.products FOR ALL TO authenticated USING ( (auth.jwt() ->> 'email') IN ('master@gfitlife.com', 'pereira.itapema@gmail.com') );

DROP POLICY IF EXISTS "Perfil visível pelo próprio usuário" ON public.user_profile;
CREATE POLICY "Perfil visível pelo próprio usuário" ON public.user_profile FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Admins gerem todos os perfis" ON public.user_profile;
CREATE POLICY "Admins gerem todos os perfis" ON public.user_profile FOR ALL TO authenticated USING ( (auth.jwt() ->> 'email') IN ('master@gfitlife.com', 'pereira.itapema@gmail.com') );

-- Garantir bucket uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true) ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "Permitir upload para autenticados" ON storage.objects;
CREATE POLICY "Permitir upload para autenticados" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Acesso público para leitura" ON storage.objects;
CREATE POLICY "Acesso público para leitura" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');