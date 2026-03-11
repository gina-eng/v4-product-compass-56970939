-- Ensure pgcrypto password helpers are resolvable for Supabase Auth password login.
-- Some environments install pgcrypto in "extensions" and GoTrue resolves crypt()/gen_salt()
-- from "public" during password verification.

DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'extensions') THEN
    CREATE SCHEMA extensions;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
    CREATE EXTENSION pgcrypto WITH SCHEMA extensions;
  END IF;
END
$do$;

DO $do$
DECLARE
  has_extensions BOOLEAN;
  has_public BOOLEAN;
BEGIN
  has_extensions := to_regprocedure('extensions.crypt(text,text)') IS NOT NULL
    AND to_regprocedure('extensions.gen_salt(text)') IS NOT NULL;
  has_public := to_regprocedure('public.crypt(text,text)') IS NOT NULL
    AND to_regprocedure('public.gen_salt(text)') IS NOT NULL;

  IF NOT has_extensions AND NOT has_public THEN
    RAISE EXCEPTION 'pgcrypto crypt/gen_salt not found in public or extensions schema';
  END IF;

  IF has_extensions AND to_regprocedure('public.crypt(text,text)') IS NULL THEN
    EXECUTE $fn$
      CREATE FUNCTION public.crypt(password TEXT, salt TEXT)
      RETURNS TEXT
      LANGUAGE sql
      IMMUTABLE
      STRICT
      SECURITY DEFINER
      SET search_path = pg_catalog
      AS $$ SELECT extensions.crypt($1, $2); $$;
    $fn$;
  END IF;

  IF has_extensions AND to_regprocedure('public.gen_salt(text)') IS NULL THEN
    EXECUTE $fn$
      CREATE FUNCTION public.gen_salt(algorithm TEXT)
      RETURNS TEXT
      LANGUAGE sql
      VOLATILE
      STRICT
      SECURITY DEFINER
      SET search_path = pg_catalog
      AS $$ SELECT extensions.gen_salt($1); $$;
    $fn$;
  END IF;

  IF has_extensions AND to_regprocedure('public.gen_salt(text,integer)') IS NULL THEN
    EXECUTE $fn$
      CREATE FUNCTION public.gen_salt(algorithm TEXT, rounds INTEGER)
      RETURNS TEXT
      LANGUAGE sql
      VOLATILE
      STRICT
      SECURITY DEFINER
      SET search_path = pg_catalog
      AS $$ SELECT extensions.gen_salt($1, $2); $$;
    $fn$;
  END IF;
END
$do$;

DO $do$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
    GRANT EXECUTE ON FUNCTION public.crypt(TEXT, TEXT) TO supabase_auth_admin;
    GRANT EXECUTE ON FUNCTION public.gen_salt(TEXT) TO supabase_auth_admin;
    GRANT EXECUTE ON FUNCTION public.gen_salt(TEXT, INTEGER) TO supabase_auth_admin;
  END IF;
END
$do$;
