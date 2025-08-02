-- Adicionar coluna para armazenar dados da tabela "Como eu entrego?"
ALTER TABLE public.products 
ADD COLUMN como_entrego_dados JSONB DEFAULT '[]'::jsonb;