ALTER TABLE public.products
DROP COLUMN IF EXISTS stack_digital,
DROP COLUMN IF EXISTS bonus_kpi,
DROP COLUMN IF EXISTS garantia_especifica,
DROP COLUMN IF EXISTS kpi_principal,
DROP COLUMN IF EXISTS tempo_meta_kpi;
