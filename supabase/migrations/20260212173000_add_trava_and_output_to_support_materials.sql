ALTER TABLE public.support_materials
ADD COLUMN IF NOT EXISTS trava TEXT,
ADD COLUMN IF NOT EXISTS output_cliente TEXT;

ALTER TABLE public.support_materials
DROP CONSTRAINT IF EXISTS support_materials_trava_check;

ALTER TABLE public.support_materials
ADD CONSTRAINT support_materials_trava_check
CHECK (
  trava IS NULL
  OR trava IN (
    'trava_2',
    'trava_3',
    'trava_4',
    'trava_5',
    'trava_6',
    'trava_7',
    'trava_8'
  )
);
