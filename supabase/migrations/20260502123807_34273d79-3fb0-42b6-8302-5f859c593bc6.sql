
-- CASES: remover policies restritas e criar policies públicas
DROP POLICY IF EXISTS cases_read_v4 ON public.cases;
DROP POLICY IF EXISTS cases_insert_v4 ON public.cases;
DROP POLICY IF EXISTS cases_update_v4 ON public.cases;
DROP POLICY IF EXISTS cases_delete_v4 ON public.cases;

CREATE POLICY cases_public_select ON public.cases FOR SELECT TO public USING (true);
CREATE POLICY cases_public_insert ON public.cases FOR INSERT TO public WITH CHECK (true);
CREATE POLICY cases_public_update ON public.cases FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY cases_public_delete ON public.cases FOR DELETE TO public USING (true);

-- CONSULTANTS: idem
DROP POLICY IF EXISTS consultants_read_v4 ON public.consultants;
DROP POLICY IF EXISTS consultants_insert_v4 ON public.consultants;
DROP POLICY IF EXISTS consultants_update_v4 ON public.consultants;
DROP POLICY IF EXISTS consultants_delete_v4 ON public.consultants;

CREATE POLICY consultants_public_select ON public.consultants FOR SELECT TO public USING (true);
CREATE POLICY consultants_public_insert ON public.consultants FOR INSERT TO public WITH CHECK (true);
CREATE POLICY consultants_public_update ON public.consultants FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY consultants_public_delete ON public.consultants FOR DELETE TO public USING (true);
