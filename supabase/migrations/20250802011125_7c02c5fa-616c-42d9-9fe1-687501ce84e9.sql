-- Adicionar novos campos à tabela products

-- Primeiro, criar os enums para os campos de seleção
CREATE TYPE IF NOT EXISTS kpi_tipo AS ENUM ('CPL', 'CTR', 'CONVERSÃO', 'ENGAJAMENTO', 'TAXA DE ABERTURA');
CREATE TYPE IF NOT EXISTS tempo_meta AS ENUM ('3 meses', '6 meses', '12 meses');

-- Adicionar os novos campos à tabela products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS bonus_kpi text,
ADD COLUMN IF NOT EXISTS kpi_principal kpi_tipo,
ADD COLUMN IF NOT EXISTS tempo_meta_kpi tempo_meta,
ADD COLUMN IF NOT EXISTS garantia_especifica text,
ADD COLUMN IF NOT EXISTS stack_digital text,
ADD COLUMN IF NOT EXISTS entregaveis_relacionados text;