-- =========================================
-- Tabela: consultants
-- =========================================
CREATE TABLE public.consultants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  headline TEXT NOT NULL DEFAULT '',
  photo_url TEXT,
  unit TEXT,
  city TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  linkedin_url TEXT NOT NULL DEFAULT '',
  primary_sector TEXT NOT NULL DEFAULT '',
  secondary_sector TEXT,
  professional_profile TEXT NOT NULL DEFAULT '',
  pains_tackled TEXT NOT NULL DEFAULT '',
  value_areas TEXT NOT NULL DEFAULT '',
  highlight_projects TEXT NOT NULL DEFAULT '',
  competencies TEXT NOT NULL DEFAULT '',
  education TEXT NOT NULL DEFAULT '',
  languages TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.consultants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "consultants_read_v4" ON public.consultants
  FOR SELECT TO authenticated USING (public.is_v4_email());
CREATE POLICY "consultants_insert_v4" ON public.consultants
  FOR INSERT TO authenticated WITH CHECK (public.is_v4_email());
CREATE POLICY "consultants_update_v4" ON public.consultants
  FOR UPDATE TO authenticated USING (public.is_v4_email()) WITH CHECK (public.is_v4_email());
CREATE POLICY "consultants_delete_v4" ON public.consultants
  FOR DELETE TO authenticated USING (public.is_v4_email());

CREATE TRIGGER update_consultants_updated_at
  BEFORE UPDATE ON public.consultants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- Tabela: cases
-- =========================================
CREATE TABLE public.cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_user_id UUID,
  status TEXT NOT NULL DEFAULT 'rascunho',
  current_step INTEGER NOT NULL DEFAULT 1,

  -- Etapa 1: identificação
  owner_email TEXT NOT NULL DEFAULT '',
  v4_unit TEXT NOT NULL DEFAULT '',
  client_name TEXT NOT NULL DEFAULT '',
  client_cnpj TEXT NOT NULL DEFAULT '',
  client_status TEXT NOT NULL DEFAULT '',
  client_city TEXT NOT NULL DEFAULT '',
  client_state TEXT NOT NULL DEFAULT '',
  operation_reach TEXT NOT NULL DEFAULT '',
  collaborators JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Etapa 2: classificação
  sales_model TEXT NOT NULL DEFAULT '',
  segment TEXT NOT NULL DEFAULT '',
  nicho TEXT NOT NULL DEFAULT '',
  products JSONB NOT NULL DEFAULT '[]'::jsonb,
  primary_driver TEXT NOT NULL DEFAULT '',

  -- Etapa 3: contexto
  initial_challenges JSONB NOT NULL DEFAULT '[]'::jsonb,
  initial_challenges_other TEXT NOT NULL DEFAULT '',
  problem TEXT NOT NULL DEFAULT '',
  root_cause TEXT NOT NULL DEFAULT '',
  restrictions JSONB NOT NULL DEFAULT '[]'::jsonb,
  restrictions_other TEXT NOT NULL DEFAULT '',
  previous_attempt TEXT NOT NULL DEFAULT '',
  previous_failure_reason TEXT NOT NULL DEFAULT '',

  -- Etapa 4: estratégia
  saber_directions JSONB NOT NULL DEFAULT '[]'::jsonb,
  saber_execution TEXT NOT NULL DEFAULT '',
  ter_value_perception TEXT NOT NULL DEFAULT '',
  executar_professionals JSONB NOT NULL DEFAULT '[]'::jsonb,
  executar_channels JSONB NOT NULL DEFAULT '[]'::jsonb,
  executar_creatives JSONB NOT NULL DEFAULT '[]'::jsonb,
  executar_creatives_communication TEXT NOT NULL DEFAULT '',
  executar_strategies JSONB NOT NULL DEFAULT '[]'::jsonb,
  potencializar_value_model TEXT NOT NULL DEFAULT '',
  potencializar_indicator TEXT NOT NULL DEFAULT '',

  -- Etapa 5: resultado
  time_to_result TEXT NOT NULL DEFAULT '',
  primary_metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
  secondary_metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
  media_investment TEXT NOT NULL DEFAULT '',
  attributed_revenue TEXT NOT NULL DEFAULT '',

  -- Etapa 6: evidências
  dashboard_url TEXT NOT NULL DEFAULT '',
  presentation_url TEXT NOT NULL DEFAULT '',
  testimonial_url TEXT NOT NULL DEFAULT '',
  final_notes TEXT NOT NULL DEFAULT '',

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cases_read_v4" ON public.cases
  FOR SELECT TO authenticated USING (public.is_v4_email());
CREATE POLICY "cases_insert_v4" ON public.cases
  FOR INSERT TO authenticated WITH CHECK (public.is_v4_email());
CREATE POLICY "cases_update_v4" ON public.cases
  FOR UPDATE TO authenticated USING (public.is_v4_email()) WITH CHECK (public.is_v4_email());
CREATE POLICY "cases_delete_v4" ON public.cases
  FOR DELETE TO authenticated USING (public.is_v4_email());

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_cases_status ON public.cases(status);
CREATE INDEX idx_cases_owner_email ON public.cases(owner_email);
CREATE INDEX idx_consultants_email ON public.consultants(email);
