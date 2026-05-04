-- Adiciona descrição livre da experiência por setor (principal e complementar) no consultor
ALTER TABLE public.consultants
  ADD COLUMN IF NOT EXISTS primary_sector_experience text,
  ADD COLUMN IF NOT EXISTS secondary_sector_experience text;
