INSERT INTO public.site_settings (setting_key, setting_value, description)
VALUES (
  'stack_digital_request_form_url',
  'https://forms.gle/solicitacao-contratacao-stack-digital',
  'Link geral do botão Solicitar Contratação da Stack Digital'
)
ON CONFLICT (setting_key) DO NOTHING;
