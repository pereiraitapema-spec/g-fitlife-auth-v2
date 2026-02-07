-- G-FITLIFE DATABASE SYNC: CORE TABLES
-- Execute este script no SQL Editor do seu painel Supabase.

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
    slug TEXT,
    icon TEXT,
    description TEXT,
    seo JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Cupons (CORREÇÃO DO ERRO 404)
CREATE TABLE IF NOT EXISTS public.coupons (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL, -- 'percentage' ou 'fixed'
    value NUMERIC NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adição incremental segura de colunas para categorias
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categories' AND column_name='description') THEN
        ALTER TABLE public.categories ADD COLUMN description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categories' AND column_name='slug') THEN
        ALTER TABLE public.categories ADD COLUMN slug TEXT;
    END IF;
END $$;

-- 4. Tabela de Afiliados
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

-- Permissões de Acesso (RLS)
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY; -- Habilita segurança para cupons

-- Políticas Públicas para Testes/Admin
DROP POLICY IF EXISTS "Public Access" ON public.departments;
CREATE POLICY "Public Access" ON public.departments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Access" ON public.categories;
CREATE POLICY "Public Access" ON public.categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Access" ON public.affiliates;
CREATE POLICY "Public Access" ON public.affiliates FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Access" ON public.coupons;
CREATE POLICY "Public Access" ON public.coupons FOR ALL USING (true) WITH CHECK (true);

-- Recarregar cache da API
NOTIFY pgrst, 'reload schema';