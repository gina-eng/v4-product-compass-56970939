-- Adicionar novos campos à tabela products

-- Criar os enums para os campos de seleção (sem IF NOT EXISTS)
CREATE TYPE kpi_tipo AS ENUM ('CPL', 'CTR', 'CONVERSÃO', 'ENGAJAMENTO', 'TAXA DE ABERTURA');
CREATE TYPE tempo_meta AS ENUM ('3 meses', '6 meses', '12 meses');

-- Adicionar os novos campos à tabela products
ALTER TABLE public.products 
ADD COLUMN bonus_kpi text,
ADD COLUMN kpi_principal kpi_tipo,
ADD COLUMN tempo_meta_kpi tempo_meta,
ADD COLUMN garantia_especifica text,
ADD COLUMN stack_digital text,
ADD COLUMN entregaveis_relacionados text;