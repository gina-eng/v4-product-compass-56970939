-- Add RPC to create/update external users in batch with a default password.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF to_regclass('public.allowed_login_emails') IS NULL THEN
    RAISE EXCEPTION 'Tabela public.allowed_login_emails não encontrada. Rode a migration base antes.';
  END IF;
END
$$;

UPDATE public.allowed_login_emails
SET email = lower(trim(email))
WHERE email <> lower(trim(email));

WITH ranked AS (
  SELECT
    id,
    row_number() OVER (PARTITION BY email ORDER BY created_at, id) AS row_rank
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
    WHERE conname = 'allowed_login_emails_email_unique'
  ) THEN
    ALTER TABLE public.allowed_login_emails
      ADD CONSTRAINT allowed_login_emails_email_unique UNIQUE (email);
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.admin_upsert_external_login_users(
  p_emails TEXT[],
  p_notes TEXT[] DEFAULT '{}'::TEXT[],
  p_password TEXT DEFAULT 'v4@company'
)
RETURNS TABLE(email TEXT, action TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
        updated_at
      )
      VALUES (
        '00000000-0000-0000-0000-000000000000',
        user_id,
        'authenticated',
        'authenticated',
        normalized_email,
        crypt(trim(p_password), gen_salt('bf')),
        now(),
        now(),
        jsonb_build_object('provider', 'email', 'providers', array['email']),
        jsonb_build_object('full_name', normalized_email),
        now(),
        now()
      );

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
        jsonb_build_object('sub', user_id::text, 'email', normalized_email),
        'email',
        user_id::text,
        now(),
        now()
      )
      ON CONFLICT DO NOTHING;

      email := normalized_email;
      action := 'created';
      RETURN NEXT;
    ELSE
      UPDATE auth.users
      SET
        encrypted_password = crypt(trim(p_password), gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now()
      WHERE id = user_id;

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
        jsonb_build_object('sub', user_id::text, 'email', normalized_email),
        'email',
        user_id::text,
        now(),
        now()
      )
      ON CONFLICT DO NOTHING;

      email := normalized_email;
      action := 'updated';
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_upsert_external_login_users(TEXT[], TEXT[], TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_upsert_external_login_users(TEXT[], TEXT[], TEXT) TO authenticated;
