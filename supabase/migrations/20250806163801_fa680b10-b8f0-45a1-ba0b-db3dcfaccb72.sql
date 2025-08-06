-- Adicionar novo campo para descrição sucinta do card
ALTER TABLE public.products 
ADD COLUMN descricao_card TEXT;