-- Adicionar novas colunas para a estrutura expandida do produto
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS icp TEXT,
ADD COLUMN IF NOT EXISTS escopo TEXT,
ADD COLUMN IF NOT EXISTS duracao_media TEXT,
ADD COLUMN IF NOT EXISTS time_envolvido TEXT,
ADD COLUMN IF NOT EXISTS formato_entrega TEXT,
ADD COLUMN IF NOT EXISTS descricao_completa TEXT;

-- Adicionar comentários para documentar as novas colunas
COMMENT ON COLUMN public.products.icp IS 'Ideal Customer Profile - perfil do cliente ideal';
COMMENT ON COLUMN public.products.escopo IS 'Escopo do produto/serviço';
COMMENT ON COLUMN public.products.duracao_media IS 'Duração média de execução';
COMMENT ON COLUMN public.products.time_envolvido IS 'Informações sobre o time envolvido';
COMMENT ON COLUMN public.products.formato_entrega IS 'Formato de entrega do produto';
COMMENT ON COLUMN public.products.descricao_completa IS 'Descrição completa e detalhada do produto';