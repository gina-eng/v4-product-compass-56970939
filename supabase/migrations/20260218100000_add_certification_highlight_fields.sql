ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS certificacao_destaque_texto text,
ADD COLUMN IF NOT EXISTS certificacao_destaque_link text;
