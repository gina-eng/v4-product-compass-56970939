-- Adicionar colunas para as novas seções de produto
ALTER TABLE public.products 
ADD COLUMN para_quem_serve TEXT,
ADD COLUMN como_entrega_valor TEXT;