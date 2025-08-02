-- Criar tabela para configurações do site
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (permitir acesso público para leitura e escrita - ajustar conforme necessário)
CREATE POLICY "Site settings são visíveis para todos" 
ON public.site_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Qualquer um pode inserir configurações do site" 
ON public.site_settings 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Qualquer um pode atualizar configurações do site" 
ON public.site_settings 
FOR UPDATE 
USING (true);

CREATE POLICY "Qualquer um pode deletar configurações do site" 
ON public.site_settings 
FOR DELETE 
USING (true);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados iniciais
INSERT INTO public.site_settings (setting_key, setting_value, description) VALUES
('step_title', 'Introdução ao modelo - STEP', 'Título da seção STEP'),
('step_description', 'Toda empresa, independente do tamanho, passa por quatro momentos distintos em sua jornada de crescimento. Cada momento exige uma abordagem específica e uma solução certa. O objetivo é vender e servir o cliente certo, no momento certo, com a solução certa.

O framework STEP identifica onde o cliente está e qual solução ele realmente precisa, categorizando nossos produtos em quatro etapas fundamentais para o sucesso empresarial.', 'Descrição da seção STEP')
ON CONFLICT (setting_key) DO NOTHING;