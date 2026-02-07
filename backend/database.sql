-- G-FITLIFE DATABASE SYNC: CORE TABLES
-- Execute este script no SQL Editor do seu painel Supabase.

-- 1. Tabela de Departamentos
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Categorias
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active',
    slug TEXT,
    icon TEXT,
    description TEXT,
    seo JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Produtos
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    brand TEXT,
    price NUMERIC NOT NULL,
    original_price NUMERIC,
    category TEXT,
    image TEXT,
    rating NUMERIC DEFAULT 5,
    reviews INTEGER DEFAULT 0,
    tags TEXT[],
    description TEXT,
    is_affiliate BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active',
    department_id UUID REFERENCES public.departments(id),
    category_id UUID REFERENCES public.categories(id),
    seller_id TEXT,
    seo JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Cupons
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL, 
    discount NUMERIC NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela de Afiliados
CREATE TABLE IF NOT EXISTS public.affiliates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId TEXT,
    name TEXT,
    email TEXT,
    status TEXT DEFAULT 'inactive',
    commissionRate NUMERIC DEFAULT 15,
    totalSales INTEGER DEFAULT 0,
    balance NUMERIC DEFAULT 0,
    refCode TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela de Banners (NOVO: Correção para erro 400)
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    image_url TEXT,
    link_type TEXT,
    target_id TEXT,
    status TEXT DEFAULT 'active',
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permissões de Acesso (RLS)
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Políticas Públicas para Operação de Front-end
DROP POLICY IF EXISTS "Public Access" ON public.departments;
CREATE POLICY "Public Access" ON public.departments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Access" ON public.categories;
CREATE POLICY "Public Access" ON public.categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Access" ON public.products;
CREATE POLICY "Public Access" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Access" ON public.affiliates;
CREATE POLICY "Public Access" ON public.affiliates FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Access" ON public.coupons;
CREATE POLICY "Public Access" ON public.coupons FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Access" ON public.banners;
CREATE POLICY "Public Access" ON public.banners FOR ALL USING (true) WITH CHECK (true);

-- Recarregar cache da API
NOTIFY pgrst, 'reload schema';