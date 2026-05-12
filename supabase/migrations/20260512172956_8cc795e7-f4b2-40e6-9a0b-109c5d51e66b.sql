DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['platforms','systems','support_materials','training_materials','tier_wtp_definitions','site_settings']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_read_v4', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_insert_v4', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_update_v4', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_delete_v4', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO public USING (true)', t || '_public_select', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO public WITH CHECK (true)', t || '_public_insert', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO public USING (true) WITH CHECK (true)', t || '_public_update', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO public USING (true)', t || '_public_delete', t);
  END LOOP;
END $$;