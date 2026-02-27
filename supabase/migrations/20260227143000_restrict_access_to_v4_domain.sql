-- Restrict application access to authenticated users from @v4company.com.

CREATE OR REPLACE FUNCTION public.is_v4_email()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT
    auth.role() = 'service_role'
    OR COALESCE(lower(auth.jwt() ->> 'email'), '') LIKE '%@v4company.com';
$$;

CREATE OR REPLACE FUNCTION public.is_internal_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_v4_email();
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS NULL OR lower(NEW.email) NOT LIKE '%@v4company.com' THEN
    RAISE EXCEPTION 'Apenas emails do domínio @v4company.com são permitidos';
  END IF;

  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    updated_at = now();

  INSERT INTO public.org_members (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

DO $$
DECLARE
  target_table text;
  policy_row record;
BEGIN
  FOREACH target_table IN ARRAY ARRAY[
    'products',
    'positions',
    'product_positions',
    'training_materials',
    'site_settings',
    'support_materials',
    'platforms',
    'systems',
    'tier_wtp_definitions'
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

DO $$
DECLARE
  policy_row record;
BEGIN
  IF to_regclass('public.profiles') IS NOT NULL THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    FOR policy_row IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'profiles'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_row.policyname);
    END LOOP;

    CREATE POLICY profiles_read_v4
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (public.is_v4_email());

    CREATE POLICY profiles_insert_self_v4
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (
      public.is_v4_email()
      AND auth.uid() = user_id
      AND lower(email) LIKE '%@v4company.com'
    );

    CREATE POLICY profiles_update_self_v4
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (public.is_v4_email() AND auth.uid() = user_id)
    WITH CHECK (
      public.is_v4_email()
      AND auth.uid() = user_id
      AND lower(email) LIKE '%@v4company.com'
    );
  END IF;
END
$$;

DO $$
DECLARE
  policy_row record;
BEGIN
  IF to_regclass('public.org_members') IS NOT NULL THEN
    ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

    FOR policy_row IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'org_members'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.org_members', policy_row.policyname);
    END LOOP;

    CREATE POLICY org_members_read_v4
    ON public.org_members
    FOR SELECT
    TO authenticated
    USING (public.is_v4_email());

    CREATE POLICY org_members_insert_self_v4
    ON public.org_members
    FOR INSERT
    TO authenticated
    WITH CHECK (
      public.is_v4_email()
      AND auth.uid() = user_id
      AND role = 'user'
    );
  END IF;
END
$$;
