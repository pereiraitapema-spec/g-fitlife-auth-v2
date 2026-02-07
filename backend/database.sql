-- G-FITLIFE DATABASE SCHEMA UPDATE
-- Execute este script no SQL Editor do Supabase para garantir que a tabela 'products' esteja correta.

-- 1. Garantir que a tabela de produtos tenha todas as colunas necessárias
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

-- 2. Caso a tabela já exista mas falte a coluna brand (Correção para erro PGRST204)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='brand') THEN
        ALTER TABLE public.products ADD COLUMN brand TEXT;
    END IF;
END $$;

-- 3. Atualizar Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Acesso
DROP POLICY IF EXISTS "Produtos visíveis para todos" ON public.products;
CREATE POLICY "Produtos visíveis para todos" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins gerem produtos" ON public.products;
CREATE POLICY "Admins gerem produtos" ON public.products FOR ALL TO authenticated 
USING ( (auth.jwt() ->> 'email') IN ('master@gfitlife.com', 'pereira.itapema@gmail.com') );

-- 5. Outras tabelas vitais
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

-- Forçar atualização do esquema de cache (PostgREST)
NOTIFY pgrst, 'reload schema';