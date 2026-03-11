-- Allow non-@v4company.com users to access the app when explicitly allowlisted.

CREATE TABLE IF NOT EXISTS public.allowed_login_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT allowed_login_emails_email_not_empty CHECK (length(trim(email)) > 3)
);

UPDATE public.allowed_login_emails
SET email = lower(trim(email))
WHERE email <> lower(trim(email));

WITH ranked AS (
  SELECT
    id,
    row_number() OVER (PARTITION BY lower(email) ORDER BY created_at, id) AS row_rank
  FROM public.allowed_login_emails
)
DELETE FROM public.allowed_login_emails target
USING ranked
WHERE target.id = ranked.id
  AND ranked.row_rank > 1;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'allowed_login_emails_email_lowercase'
  ) THEN
    ALTER TABLE public.allowed_login_emails
      ADD CONSTRAINT allowed_login_emails_email_lowercase
      CHECK (email = lower(trim(email)));
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS allowed_login_emails_email_unique_idx
ON public.allowed_login_emails (lower(email));

DO $$
BEGIN
  IF to_regprocedure('public.update_updated_at_column()') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS update_allowed_login_emails_updated_at ON public.allowed_login_emails;

    CREATE TRIGGER update_allowed_login_emails_updated_at
    BEFORE UPDATE ON public.allowed_login_emails
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END
$$;

GRANT SELECT ON public.allowed_login_emails TO authenticated;

ALTER TABLE public.allowed_login_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS allowed_login_emails_select_own ON public.allowed_login_emails;
CREATE POLICY allowed_login_emails_select_own
ON public.allowed_login_emails
FOR SELECT
TO authenticated
USING (lower(email) = COALESCE(lower(auth.jwt() ->> 'email'), ''));

CREATE OR REPLACE FUNCTION public.is_allowed_portfolio_email(target_email TEXT)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_email TEXT := lower(trim(target_email));
BEGIN
  IF normalized_email IS NULL OR normalized_email = '' THEN
    RETURN false;
  END IF;

  IF normalized_email LIKE '%@v4company.com' THEN
    RETURN true;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.allowed_login_emails allowed_email
    WHERE allowed_email.is_active
      AND lower(allowed_email.email) = normalized_email
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_v4_email()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    auth.role() = 'service_role'
    OR public.is_allowed_portfolio_email(auth.jwt() ->> 'email');
$$;

REVOKE ALL ON FUNCTION public.is_allowed_portfolio_email(TEXT) FROM PUBLIC;

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
DECLARE
  normalized_email TEXT := lower(trim(NEW.email));
BEGIN
  IF normalized_email IS NULL OR normalized_email = '' THEN
    RAISE EXCEPTION 'Email inválido para criação de usuário';
  END IF;

  IF NOT public.is_allowed_portfolio_email(normalized_email) THEN
    RAISE EXCEPTION 'Apenas emails @v4company.com ou liberados na tabela public.allowed_login_emails são permitidos';
  END IF;

  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    normalized_email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', normalized_email)
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
BEGIN
  IF to_regclass('public.profiles') IS NULL THEN
    RETURN;
  END IF;

  DROP POLICY IF EXISTS profiles_insert_self_v4 ON public.profiles;
  DROP POLICY IF EXISTS profiles_update_self_v4 ON public.profiles;
  DROP POLICY IF EXISTS profiles_insert_self_allowed ON public.profiles;
  DROP POLICY IF EXISTS profiles_update_self_allowed ON public.profiles;

  CREATE POLICY profiles_insert_self_allowed
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_v4_email()
    AND auth.uid() = user_id
    AND lower(trim(email)) = COALESCE(lower(auth.jwt() ->> 'email'), '')
  );

  CREATE POLICY profiles_update_self_allowed
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_v4_email() AND auth.uid() = user_id)
  WITH CHECK (
    public.is_v4_email()
    AND auth.uid() = user_id
    AND lower(trim(email)) = COALESCE(lower(auth.jwt() ->> 'email'), '')
  );
END
$$;
