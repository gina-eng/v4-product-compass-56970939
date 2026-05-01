CREATE TABLE public.v4_units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.v4_units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "v4_units_public_select" ON public.v4_units FOR SELECT USING (true);
CREATE POLICY "v4_units_public_insert" ON public.v4_units FOR INSERT WITH CHECK (true);
CREATE POLICY "v4_units_public_update" ON public.v4_units FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "v4_units_public_delete" ON public.v4_units FOR DELETE USING (true);

CREATE TRIGGER set_v4_units_updated_at
BEFORE UPDATE ON public.v4_units
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();