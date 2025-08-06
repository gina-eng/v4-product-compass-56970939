-- Atualizar produtos existentes que não têm descrição do card
-- Usando a primeira parte da descrição completa como descrição do card
UPDATE public.products 
SET descricao_card = LEFT(description, 100)
WHERE descricao_card IS NULL OR descricao_card = '';