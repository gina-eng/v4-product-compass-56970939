-- Adicionar campo para controlar se o produto usa dedicação
ALTER TABLE public.products 
ADD COLUMN usa_dedicacao boolean NOT NULL DEFAULT false;

-- Comentário explicativo
COMMENT ON COLUMN public.products.usa_dedicacao IS 'Define se o produto permite configurar nível de dedicação (aplicável principalmente para categoria EXECUTAR)';