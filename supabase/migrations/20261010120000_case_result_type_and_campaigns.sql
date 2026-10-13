-- Tipo de resultado do case + campanhas especiais.
--
-- Migration 100% aditiva: só adiciona colunas e tabelas novas. Nenhuma tabela
-- ou coluna existente é removida/renomeada e nenhum dado é apagado.
--
-- 1) cases ganha colunas para cases de "entrega / percepção" (social media,
--    manual de marca etc.), que não têm resultado direto de negócio:
--    result_type, success_thesis, qualitative_before, qualitative_after,
--    success_proofs e delivery_metrics. Cases legados recebem o DEFAULT
--    'negocio' e continuam se comportando exatamente como hoje.
-- 2) case_campaigns: campanhas especiais (ex.: Black Friday) configuradas no
--    admin, com período de vigência.
-- 3) case_campaign_links: vínculo N:N entre cases e campanhas.
--
-- Tabelas novas nascem com RLS restrita a @v4company.com (+ allowed_login_emails)
-- via public.is_v4_email(), mesmo padrão de
-- 20260526120000_restore_v4_only_access_to_portfolio_tables.sql.

-- =========================================
-- cases: colunas novas
-- =========================================
ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS result_type TEXT NOT NULL DEFAULT 'negocio',
  ADD COLUMN IF NOT EXISTS success_thesis TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS qualitative_before TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS qualitative_after TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS success_proofs JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS delivery_metrics JSONB NOT NULL DEFAULT '[]'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'cases_result_type_check'
      AND conrelid = 'public.cases'::regclass
  ) THEN
    ALTER TABLE public.cases
      ADD CONSTRAINT cases_result_type_check
      CHECK (result_type IN ('negocio', 'entrega', 'ambos'));
  END IF;
END
$$;

-- =========================================
-- Tabela: case_campaigns
-- =========================================
CREATE TABLE IF NOT EXISTS public.case_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '',
  starts_at DATE NOT NULL,
  ends_at DATE NOT NULL,
  archived_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT case_campaigns_period_check CHECK (ends_at >= starts_at)
);

ALTER TABLE public.case_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "case_campaigns_read_v4" ON public.case_campaigns;
DROP POLICY IF EXISTS "case_campaigns_insert_v4" ON public.case_campaigns;
DROP POLICY IF EXISTS "case_campaigns_update_v4" ON public.case_campaigns;
DROP POLICY IF EXISTS "case_campaigns_delete_v4" ON public.case_campaigns;

CREATE POLICY "case_campaigns_read_v4" ON public.case_campaigns
  FOR SELECT TO authenticated USING (public.is_v4_email());
CREATE POLICY "case_campaigns_insert_v4" ON public.case_campaigns
  FOR INSERT TO authenticated WITH CHECK (public.is_v4_email());
CREATE POLICY "case_campaigns_update_v4" ON public.case_campaigns
  FOR UPDATE TO authenticated USING (public.is_v4_email()) WITH CHECK (public.is_v4_email());
CREATE POLICY "case_campaigns_delete_v4" ON public.case_campaigns
  FOR DELETE TO authenticated USING (public.is_v4_email());

DROP TRIGGER IF EXISTS update_case_campaigns_updated_at ON public.case_campaigns;
CREATE TRIGGER update_case_campaigns_updated_at
  BEFORE UPDATE ON public.case_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- Tabela: case_campaign_links
-- =========================================
-- ON DELETE CASCADE no case: excluir um case remove só os vínculos dele.
-- ON DELETE RESTRICT na campanha: campanha com cases vinculados não pode ser
-- excluída (o admin deve arquivar).
CREATE TABLE IF NOT EXISTS public.case_campaign_links (
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.case_campaigns(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (case_id, campaign_id)
);

CREATE INDEX IF NOT EXISTS idx_case_campaign_links_campaign_id
  ON public.case_campaign_links(campaign_id);

ALTER TABLE public.case_campaign_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "case_campaign_links_read_v4" ON public.case_campaign_links;
DROP POLICY IF EXISTS "case_campaign_links_insert_v4" ON public.case_campaign_links;
DROP POLICY IF EXISTS "case_campaign_links_update_v4" ON public.case_campaign_links;
DROP POLICY IF EXISTS "case_campaign_links_delete_v4" ON public.case_campaign_links;

CREATE POLICY "case_campaign_links_read_v4" ON public.case_campaign_links
  FOR SELECT TO authenticated USING (public.is_v4_email());
CREATE POLICY "case_campaign_links_insert_v4" ON public.case_campaign_links
  FOR INSERT TO authenticated WITH CHECK (public.is_v4_email());
CREATE POLICY "case_campaign_links_update_v4" ON public.case_campaign_links
  FOR UPDATE TO authenticated USING (public.is_v4_email()) WITH CHECK (public.is_v4_email());
CREATE POLICY "case_campaign_links_delete_v4" ON public.case_campaign_links
  FOR DELETE TO authenticated USING (public.is_v4_email());
