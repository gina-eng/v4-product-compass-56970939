-- Corrigir Functions com Search Path Mutable
BEGIN;

-- Corrigir função is_internal_user
CREATE OR REPLACE FUNCTION public.is_internal_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.org_members 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'staff')
    );
$$;

-- Corrigir função update_updated_at_column se existir
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

COMMIT;