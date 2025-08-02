-- Inserir configurações das categorias STEP na tabela site_settings
INSERT INTO public.site_settings (setting_key, setting_value, description) VALUES
('saber_subtitle', 'Não sei o que não sei', 'Subtítulo da categoria Saber'),
('saber_description', 'Identificar necessidades e oportunidades ainda desconhecidas', 'Descrição da categoria Saber'),
('ter_subtitle', 'Sei o que preciso, mas não tenho', 'Subtítulo da categoria Ter'),
('ter_description', 'Adquirir recursos e ferramentas necessárias', 'Descrição da categoria Ter'),
('executar_subtitle', 'Tenho tudo, mas preciso fazer funcionar', 'Subtítulo da categoria Executar'),
('executar_description', 'Implementar e operacionalizar soluções', 'Descrição da categoria Executar'),
('potencializar_subtitle', 'Domino tudo, quero resultados extraordinários', 'Subtítulo da categoria Potencializar'),
('potencializar_description', 'Otimizar e escalar para máxima performance', 'Descrição da categoria Potencializar')
ON CONFLICT (setting_key) DO NOTHING;