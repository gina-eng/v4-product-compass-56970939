-- Add grouping metadata for external users imported in batch and update RPC.

ALTER TABLE public.allowed_login_emails
  ADD COLUMN IF NOT EXISTS import_group_id UUID,
  ADD COLUMN IF NOT EXISTS import_group_note TEXT;

CREATE INDEX IF NOT EXISTS allowed_login_emails_import_group_id_idx
  ON public.allowed_login_emails (import_group_id);

UPDATE public.allowed_login_emails
SET import_group_note = notes
WHERE import_group_note IS NULL
  AND notes IS NOT NULL;

DROP FUNCTION IF EXISTS public.admin_upsert_external_login_users(TEXT[], TEXT[], TEXT);

CREATE OR REPLACE FUNCTION public.admin_upsert_external_login_users(
  p_emails TEXT[],
  p_notes TEXT[] DEFAULT '{}'::TEXT[],
  p_password TEXT DEFAULT 'v4@company',
  p_group_id UUID DEFAULT NULL,
  p_group_note TEXT DEFAULT NULL
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
  normalized_group_note TEXT := NULLIF(trim(COALESCE(p_group_note, '')), '');
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
    normalized_note := NULLIF(trim(COALESCE(p_notes[idx], normalized_group_note, '')), '');

    IF normalized_email = '' THEN
      CONTINUE;
    END IF;

    INSERT INTO public.allowed_login_emails (
      email,
      notes,
      is_active,
      import_group_id,
      import_group_note
    )
    VALUES (
      normalized_email,
      normalized_note,
      true,
      p_group_id,
      normalized_group_note
    )
    ON CONFLICT ON CONSTRAINT allowed_login_emails_email_unique DO UPDATE
    SET
      notes = COALESCE(EXCLUDED.notes, public.allowed_login_emails.notes),
      is_active = true,
      import_group_id = COALESCE(EXCLUDED.import_group_id, public.allowed_login_emails.import_group_id),
      import_group_note = COALESCE(EXCLUDED.import_group_note, public.allowed_login_emails.import_group_note),
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

      action := 'created';
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

      action := 'updated';
    END IF;

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
    RETURN NEXT;
  END LOOP;
END;
$fn$;

REVOKE ALL ON FUNCTION public.admin_upsert_external_login_users(TEXT[], TEXT[], TEXT, UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_upsert_external_login_users(TEXT[], TEXT[], TEXT, UUID, TEXT) TO authenticated;
