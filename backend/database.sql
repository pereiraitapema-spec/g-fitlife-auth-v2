-- G-FITLIFE DATABASE RECOVERY SCRIPT
-- Execute este script no SQL Editor do Supabase para corrigir o erro PGRST204 e sincronizar colunas.

-- 1. Garantir que a tabela products tenha todas as colunas mapeadas no storeService
DO $$ 
BEGIN 
    -- Coluna de Marca
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='brand') THEN
        ALTER TABLE public.products ADD COLUMN brand TEXT;
    END IF;

    -- Coluna de Preço Original
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='original_price') THEN
        ALTER TABLE public.products ADD COLUMN original_price NUMERIC;
    END IF;

    -- Coluna de Categoria (ID) - CORREÇÃO DO ERRO ATUAL
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='category_id') THEN
        ALTER TABLE public.products ADD COLUMN category_id TEXT;
    END IF;

    -- Coluna de Departamento (ID)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='department_id') THEN
        ALTER TABLE public.products ADD COLUMN department_id TEXT;
    END IF;

    -- Coluna de Vendedor/Seller
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='seller_id') THEN
        ALTER TABLE public.products ADD COLUMN seller_id TEXT;
    END IF;

    -- Coluna de SEO (JSONB)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='seo') THEN
        ALTER TABLE public.products ADD COLUMN seo JSONB DEFAULT '{}';
    END IF;

    -- Coluna de Status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='status') THEN
        ALTER TABLE public.products ADD COLUMN status TEXT DEFAULT 'active';
    END IF;
END $$;

-- 2. FORÇAR RECARREGAMENTO DO ESQUEMA (Vital para que o Supabase enxergue as novas colunas)
-- Isso limpa o cache de metadados do PostgREST
NOTIFY pgrst, 'reload schema';