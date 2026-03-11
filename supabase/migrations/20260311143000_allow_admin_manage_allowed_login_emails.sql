-- Allow @v4company.com users to manage allowlisted external login emails from the admin UI.

GRANT INSERT, UPDATE, DELETE ON TABLE public.allowed_login_emails TO authenticated;

DROP POLICY IF EXISTS allowed_login_emails_select_own ON public.allowed_login_emails;
DROP POLICY IF EXISTS allowed_login_emails_admin_manage ON public.allowed_login_emails;

CREATE POLICY allowed_login_emails_select_own
ON public.allowed_login_emails
FOR SELECT
TO authenticated
USING (lower(email) = COALESCE(lower(auth.jwt() ->> 'email'), ''));

CREATE POLICY allowed_login_emails_admin_manage
ON public.allowed_login_emails
FOR ALL
TO authenticated
USING (COALESCE(lower(auth.jwt() ->> 'email'), '') LIKE '%@v4company.com')
WITH CHECK (COALESCE(lower(auth.jwt() ->> 'email'), '') LIKE '%@v4company.com');
