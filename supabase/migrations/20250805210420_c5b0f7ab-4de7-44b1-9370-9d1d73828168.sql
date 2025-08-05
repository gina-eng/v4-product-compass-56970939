-- Adicionar campo markup na tabela products
ALTER TABLE public.products 
ADD COLUMN markup NUMERIC DEFAULT 1.0;