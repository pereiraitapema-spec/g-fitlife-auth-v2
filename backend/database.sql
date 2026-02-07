-- G-FITLIFE DATABASE FIX: CATEGORY_ID AND SCHEMA RELOAD
-- Execute este script no SQL Editor do seu Supabase para resolver o erro de "column not found".

DO $$ 
BEGIN 
    -- 1. Garante que a tabela products existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products') THEN
        CREATE TABLE public.products (
            id BIGINT PRIMARY KEY,
            name TEXT NOT NULL,
            price NUMERIC NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;

    -- 2. Adiciona colunas de classificação se faltarem
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='category_id') THEN
        ALTER TABLE public.products ADD COLUMN category_id TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='department_id') THEN
        ALTER TABLE public.products ADD COLUMN department_id TEXT;
    END IF;

    -- 3. Outras colunas necessárias para o catálogo e sincronização com o frontend
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='brand') THEN
        ALTER TABLE public.products ADD COLUMN brand TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='original_price') THEN
        ALTER TABLE public.products ADD COLUMN original_price NUMERIC;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='category') THEN
        ALTER TABLE public.products ADD COLUMN category TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='image') THEN
        ALTER TABLE public.products ADD COLUMN image TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='rating') THEN
        ALTER TABLE public.products ADD COLUMN rating NUMERIC DEFAULT 5;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='reviews') THEN
        ALTER TABLE public.products ADD COLUMN reviews INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='tags') THEN
        ALTER TABLE public.products ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='description') THEN
        ALTER TABLE public.products ADD COLUMN description TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='is_affiliate') THEN
        ALTER TABLE public.products ADD COLUMN is_affiliate BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='status') THEN
        ALTER TABLE public.products ADD COLUMN status TEXT DEFAULT 'active';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='seller_id') THEN
        ALTER TABLE public.products ADD COLUMN seller_id TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='seo') THEN
        ALTER TABLE public.products ADD COLUMN seo JSONB DEFAULT '{}';
    END IF;

END $$;

-- 4. CRÍTICO: Recarregar o cache do PostgREST (Supabase API)
-- Isso garante que as novas colunas sejam visíveis imediatamente para a API REST.
NOTIFY pgrst, 'reload schema';