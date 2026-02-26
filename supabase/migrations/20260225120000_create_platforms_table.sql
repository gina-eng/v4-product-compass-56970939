CREATE TABLE IF NOT EXISTS public.platforms (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT 'Geral',
  status text NOT NULL DEFAULT 'Ativa',
  client_logo_url text,
  short_description text,
  general_description text,
  gtm_maturity text,
  icp_recommended text,
  practical_applications text,
  benefits_and_advantages text,
  client_benefits text,
  unit_benefits text,
  partnership_regulations text,
  base_pricing text,
  commission_and_invoicing text,
  how_to_hire text,
  technical_commercial_support text,
  forum_url text,
  request_form_url text,
  useful_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  operational_capacity_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  strategic_potential_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  thumbs_up_count integer NOT NULL DEFAULT 0,
  thumbs_down_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Platforms are viewable by everyone" ON public.platforms;
CREATE POLICY "Platforms are viewable by everyone"
ON public.platforms
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Anyone can create platforms" ON public.platforms;
CREATE POLICY "Anyone can create platforms"
ON public.platforms
FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update platforms" ON public.platforms;
CREATE POLICY "Anyone can update platforms"
ON public.platforms
FOR UPDATE
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can delete platforms" ON public.platforms;
CREATE POLICY "Anyone can delete platforms"
ON public.platforms
FOR DELETE
USING (true);

DROP TRIGGER IF EXISTS update_platforms_updated_at ON public.platforms;
CREATE TRIGGER update_platforms_updated_at
BEFORE UPDATE ON public.platforms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_platforms_slug ON public.platforms (slug);
CREATE INDEX IF NOT EXISTS idx_platforms_status ON public.platforms (status);
CREATE INDEX IF NOT EXISTS idx_platforms_category ON public.platforms (category);
