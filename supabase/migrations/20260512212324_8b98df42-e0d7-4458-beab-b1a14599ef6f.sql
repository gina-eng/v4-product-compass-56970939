ALTER TABLE public.v4_units RENAME COLUMN id TO id_units;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS id_units uuid;
CREATE INDEX IF NOT EXISTS idx_cases_id_units ON public.cases(id_units);