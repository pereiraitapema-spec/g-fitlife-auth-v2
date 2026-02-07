-- G-FITLIFE DATABASE RECOVERY SCRIPT - FULL SYNC
-- Execute este script no SQL Editor do Supabase para sincronizar a tabela products.

DO $$ 
BEGIN 
    -- 1. Colunas de Identificação e Mídia
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='brand') THEN
        ALTER TABLE public.products ADD COLUMN brand TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='image') THEN
        ALTER TABLE public.products ADD COLUMN image TEXT;
    END IF;

    -- 2. Colunas de Classificação
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='category') THEN
        ALTER TABLE public.products ADD COLUMN category TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='category_id') THEN
        ALTER TABLE public.products ADD COLUMN category_id TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='department_id') THEN
        ALTER TABLE public.products ADD COLUMN department_id TEXT;
    END IF;

    -- 3. Colunas de Preço e Social
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='original_price') THEN
        ALTER TABLE public.products ADD COLUMN original_price NUMERIC;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='rating') THEN
        ALTER TABLE public.products ADD COLUMN rating NUMERIC DEFAULT 5;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='reviews') THEN
        ALTER TABLE public.products ADD COLUMN reviews INTEGER DEFAULT 0;
    END IF;

    -- 4. Colunas de Conteúdo e Metadados
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='description') THEN
        ALTER TABLE public.products ADD COLUMN description TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='tags') THEN
        ALTER TABLE public.products ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='seo') THEN
        ALTER TABLE public.products ADD COLUMN seo JSONB DEFAULT '{}';
    END IF;

    -- 5. Colunas de Status e Origem
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='status') THEN
        ALTER TABLE public.products ADD COLUMN status TEXT DEFAULT 'active';
    END IF;

    -- CORREÇÃO DO ERRO ATUAL: Garantir is_affiliate
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='is_affiliate') THEN
        ALTER TABLE public.products ADD COLUMN is_affiliate BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='seller_id') THEN
        ALTER TABLE public.products ADD COLUMN seller_id TEXT;
    END IF;
END $$;

-- COMANDO CRÍTICO: Forçar o Supabase a reconstruir o cache da API
-- Isso resolve o erro "Could not find column... in the schema cache"
NOTIFY pgrst, 'reload schema';