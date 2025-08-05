-- Add fields for cases to products table
ALTER TABLE public.products 
ADD COLUMN case_1_unidade_responsavel TEXT,
ADD COLUMN case_1_responsavel_projeto TEXT,
ADD COLUMN case_1_documento_url TEXT,
ADD COLUMN case_2_unidade_responsavel TEXT,
ADD COLUMN case_2_responsavel_projeto TEXT,
ADD COLUMN case_2_documento_url TEXT;