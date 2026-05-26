-- Restore @v4company.com-only access to portfolio tables that were
-- reopened to public role by migrations 20260502123807, 20260512171935
-- and 20260512172956. Also closes v4_units, which was created open.
--
-- Affected tables: cases, consultants, products, product_positions,
-- positions, platforms, systems, support_materials, training_materials,
-- tier_wtp_definitions, site_settings, v4_units.
--
-- Tables already correctly restricted are NOT touched here:
-- profiles, org_members, allowed_login_emails.

DO $$
DECLARE
  target_table text;
  policy_row record;
BEGIN
  FOREACH target_table IN ARRAY ARRAY[
    'cases',
    'consultants',
    'products',
    'product_positions',
    'positions',
    'platforms',
    'systems',
    'support_materials',
    'training_materials',
    'tier_wtp_definitions',
    'site_settings',
    'v4_units'
  ] LOOP
    IF to_regclass('public.' || target_table) IS NULL THEN
      CONTINUE;
    END IF;

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', target_table);

    FOR policy_row IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = target_table
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_row.policyname, target_table);
    END LOOP;

    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.is_v4_email())',
      target_table || '_read_v4',
      target_table
    );

    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (public.is_v4_email())',
      target_table || '_insert_v4',
      target_table
    );

    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.is_v4_email()) WITH CHECK (public.is_v4_email())',
      target_table || '_update_v4',
      target_table
    );

    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (public.is_v4_email())',
      target_table || '_delete_v4',
      target_table
    );
  END LOOP;
END
$$;
