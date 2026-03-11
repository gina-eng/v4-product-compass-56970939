-- Fix password login schema resolution for external users created from admin.
-- This script hardens crypt/gen_salt resolution and role grants used by Supabase Auth.

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

-- Ensure public wrappers exist when pgcrypto lives in extensions.
DO $do$
BEGIN
  IF to_regprocedure('extensions.crypt(text,text)') IS NOT NULL
     AND to_regprocedure('public.crypt(text,text)') IS NULL THEN
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

  IF to_regprocedure('extensions.gen_salt(text)') IS NOT NULL
     AND to_regprocedure('public.gen_salt(text)') IS NULL THEN
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

  IF to_regprocedure('extensions.gen_salt(text,integer)') IS NOT NULL
     AND to_regprocedure('public.gen_salt(text,integer)') IS NULL THEN
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
    GRANT USAGE ON SCHEMA public TO supabase_auth_admin;

    IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'extensions') THEN
      GRANT USAGE ON SCHEMA extensions TO supabase_auth_admin;
    END IF;

    IF to_regprocedure('extensions.crypt(text,text)') IS NOT NULL THEN
      GRANT EXECUTE ON FUNCTION extensions.crypt(TEXT, TEXT) TO supabase_auth_admin;
    END IF;

    IF to_regprocedure('extensions.gen_salt(text)') IS NOT NULL THEN
      GRANT EXECUTE ON FUNCTION extensions.gen_salt(TEXT) TO supabase_auth_admin;
    END IF;

    IF to_regprocedure('extensions.gen_salt(text,integer)') IS NOT NULL THEN
      GRANT EXECUTE ON FUNCTION extensions.gen_salt(TEXT, INTEGER) TO supabase_auth_admin;
    END IF;

    GRANT EXECUTE ON FUNCTION public.crypt(TEXT, TEXT) TO supabase_auth_admin;
    GRANT EXECUTE ON FUNCTION public.gen_salt(TEXT) TO supabase_auth_admin;
    GRANT EXECUTE ON FUNCTION public.gen_salt(TEXT, INTEGER) TO supabase_auth_admin;
  END IF;
END
$do$;

-- Recreate RPC using public wrappers to avoid schema-specific function references.
CREATE OR REPLACE FUNCTION public.admin_upsert_external_login_users(
  p_emails TEXT[],
  p_notes TEXT[] DEFAULT '{}'::TEXT[],
  p_password TEXT DEFAULT 'v4@company'
)
RETURNS TABLE(email TEXT, action TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
#variable_conflict use_column
DECLARE
  requester_email TEXT := COALESCE(lower(auth.jwt() ->> 'email'), '');
  normalized_email TEXT;
  normalized_note TEXT;
  user_id UUID;
  idx INTEGER;
BEGIN
  IF requester_email NOT LIKE '%@v4company.com' THEN
    RAISE EXCEPTION 'Apenas usuários @v4company.com podem gerenciar acessos externos';
  END IF;

  IF p_emails IS NULL OR COALESCE(array_length(p_emails, 1), 0) = 0 THEN
    RAISE EXCEPTION 'Informe ao menos um e-mail';
  END IF;

  IF p_password IS NULL OR length(trim(p_password)) < 6 THEN
    RAISE EXCEPTION 'A senha padrão precisa ter no mínimo 6 caracteres';
  END IF;

  FOR idx IN 1..array_length(p_emails, 1) LOOP
    normalized_email := lower(trim(COALESCE(p_emails[idx], '')));
    normalized_note := NULLIF(trim(COALESCE(p_notes[idx], '')), '');

    IF normalized_email = '' THEN
      CONTINUE;
    END IF;

    INSERT INTO public.allowed_login_emails (email, notes, is_active)
    VALUES (normalized_email, normalized_note, true)
    ON CONFLICT ON CONSTRAINT allowed_login_emails_email_unique DO UPDATE
    SET
      notes = COALESCE(EXCLUDED.notes, public.allowed_login_emails.notes),
      is_active = true,
      updated_at = now();

    SELECT au.id
    INTO user_id
    FROM auth.users au
    WHERE lower(au.email) = normalized_email
    LIMIT 1;

    IF user_id IS NULL THEN
      user_id := gen_random_uuid();

      INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        confirmation_sent_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
      )
      VALUES (
        '00000000-0000-0000-0000-000000000000',
        user_id,
        'authenticated',
        'authenticated',
        normalized_email,
        public.crypt(trim(p_password), public.gen_salt('bf'::text)),
        now(),
        now(),
        jsonb_build_object('provider', 'email', 'providers', array['email']),
        jsonb_build_object('full_name', normalized_email),
        now(),
        now(),
        '',
        '',
        '',
        ''
      );

      UPDATE auth.identities ai
      SET
        identity_data = jsonb_build_object(
          'sub', user_id::text,
          'email', normalized_email,
          'email_verified', true,
          'phone_verified', false
        ),
        provider_id = normalized_email,
        updated_at = now()
      WHERE ai.user_id = user_id
        AND ai.provider = 'email';

      IF NOT FOUND THEN
        INSERT INTO auth.identities (
          id,
          user_id,
          identity_data,
          provider,
          provider_id,
          created_at,
          updated_at
        )
        VALUES (
          gen_random_uuid(),
          user_id,
          jsonb_build_object(
            'sub', user_id::text,
            'email', normalized_email,
            'email_verified', true,
            'phone_verified', false
          ),
          'email',
          normalized_email,
          now(),
          now()
        )
        ON CONFLICT DO NOTHING;
      END IF;

      email := normalized_email;
      action := 'created';
      RETURN NEXT;
    ELSE
      UPDATE auth.users
      SET
        encrypted_password = public.crypt(trim(p_password), public.gen_salt('bf'::text)),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        confirmation_token = COALESCE(confirmation_token, ''),
        email_change = COALESCE(email_change, ''),
        email_change_token_new = COALESCE(email_change_token_new, ''),
        recovery_token = COALESCE(recovery_token, ''),
        updated_at = now()
      WHERE id = user_id;

      UPDATE auth.identities ai
      SET
        identity_data = jsonb_build_object(
          'sub', user_id::text,
          'email', normalized_email,
          'email_verified', true,
          'phone_verified', false
        ),
        provider_id = normalized_email,
        updated_at = now()
      WHERE ai.user_id = user_id
        AND ai.provider = 'email';

      IF NOT FOUND THEN
        INSERT INTO auth.identities (
          id,
          user_id,
          identity_data,
          provider,
          provider_id,
          created_at,
          updated_at
        )
        VALUES (
          gen_random_uuid(),
          user_id,
          jsonb_build_object(
            'sub', user_id::text,
            'email', normalized_email,
            'email_verified', true,
            'phone_verified', false
          ),
          'email',
          normalized_email,
          now(),
          now()
        )
        ON CONFLICT DO NOTHING;
      END IF;

      email := normalized_email;
      action := 'updated';
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$fn$;

REVOKE ALL ON FUNCTION public.admin_upsert_external_login_users(TEXT[], TEXT[], TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_upsert_external_login_users(TEXT[], TEXT[], TEXT) TO authenticated;

-- Ensure required auth token fields are not NULL for allowlisted users.
UPDATE auth.users au
SET
  confirmation_token = COALESCE(au.confirmation_token, ''),
  email_change = COALESCE(au.email_change, ''),
  email_change_token_new = COALESCE(au.email_change_token_new, ''),
  recovery_token = COALESCE(au.recovery_token, ''),
  updated_at = now()
FROM public.allowed_login_emails ale
WHERE lower(ale.email) = lower(au.email)
  AND (
    au.confirmation_token IS NULL
    OR au.email_change IS NULL
    OR au.email_change_token_new IS NULL
    OR au.recovery_token IS NULL
  );

-- Repair existing external users created before provider_id/identity_data normalization.
DO $do$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT
      au.id AS user_id,
      lower(au.email) AS email
    FROM auth.users au
    JOIN public.allowed_login_emails ale
      ON lower(ale.email) = lower(au.email)
  LOOP
    DELETE FROM auth.identities ai
    WHERE ai.provider = 'email'
      AND lower(ai.provider_id) = rec.email
      AND ai.user_id <> rec.user_id;

    UPDATE auth.identities ai
    SET
      provider_id = rec.email,
      identity_data = jsonb_build_object(
        'sub', rec.user_id::text,
        'email', rec.email,
        'email_verified', true,
        'phone_verified', false
      ),
      updated_at = now()
    WHERE ai.user_id = rec.user_id
      AND ai.provider = 'email';

    IF NOT FOUND THEN
      INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        created_at,
        updated_at
      )
      VALUES (
        gen_random_uuid(),
        rec.user_id,
        jsonb_build_object(
          'sub', rec.user_id::text,
          'email', rec.email,
          'email_verified', true,
          'phone_verified', false
        ),
        'email',
        rec.email,
        now(),
        now()
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END
$do$;
