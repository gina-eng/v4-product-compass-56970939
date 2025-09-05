-- Adicionar novos campos para markup overhead e outros na tabela products
ALTER TABLE public.products 
ADD COLUMN markup_overhead numeric DEFAULT 1.0,
ADD COLUMN outros numeric DEFAULT 0;