-- Adicionar campos para Use Case Maps aos produtos
ALTER TABLE public.products 
ADD COLUMN use_case_map_1_name TEXT DEFAULT 'Use Case Map 1',
ADD COLUMN use_case_map_1_data JSONB DEFAULT '{"problema": "", "persona": "", "alternativa": "", "why": "", "frequencia": ""}',
ADD COLUMN use_case_map_2_name TEXT DEFAULT 'Use Case Map 2', 
ADD COLUMN use_case_map_2_data JSONB DEFAULT '{"problema": "", "persona": "", "alternativa": "", "why": "", "frequencia": ""}';