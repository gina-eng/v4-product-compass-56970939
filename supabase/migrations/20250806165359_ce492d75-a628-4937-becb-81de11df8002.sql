-- Limpar descrições de card vazias (strings vazias ou apenas espaços)
UPDATE public.products 
SET descricao_card = NULL
WHERE descricao_card IS NOT NULL 
  AND (descricao_card = '' OR TRIM(descricao_card) = '');