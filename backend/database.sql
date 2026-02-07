-- G-FITLIFE DATABASE SYNC: CORE TABLES
-- Execute este script no SQL Editor do Supabase para criar as tabelas faltantes.

-- 1. Tabela de Departamentos
CREATE TABLE IF NOT EXISTS public.departments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Categorias
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    department_id TEXT REFERENCES public.departments(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Afiliados
-- Nota: Colunas em aspas duplas para manter o camelCase esperado pelo frontend
CREATE TABLE IF NOT EXISTS public.affiliates (
    id TEXT PRIMARY KEY,
    "userId" TEXT,
    name TEXT,
    email TEXT,
    status TEXT DEFAULT 'inactive',
    "commissionRate" NUMERIC DEFAULT 15,
    "totalSales" INTEGER DEFAULT 0,
    balance NUMERIC DEFAULT 0,
    "refCode" TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Links de Rastreamento (Tracking Links)
CREATE TABLE IF NOT EXISTS public.tracking_links (
    id BIGSERIAL PRIMARY KEY,
    affiliate_id TEXT REFERENCES public.affiliates(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
    slug TEXT UNIQUE,
    visits INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Outras tabelas auxiliares se não existirem
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Garantir permissões públicas (para desenvolvimento/teste inicial)
-- Em produção, recomenda-se configurar RLS adequadamente.
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Access" ON public.departments;
CREATE POLICY "Public Access" ON public.departments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Access" ON public.categories;
CREATE POLICY "Public Access" ON public.categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Access" ON public.affiliates;
CREATE POLICY "Public Access" ON public.affiliates FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Access" ON public.tracking_links;
CREATE POLICY "Public Access" ON public.tracking_links FOR ALL USING (true) WITH CHECK (true);

-- 7. CRÍTICO: Recarregar o cache do PostgREST (Supabase API)
NOTIFY pgrst, 'reload schema';