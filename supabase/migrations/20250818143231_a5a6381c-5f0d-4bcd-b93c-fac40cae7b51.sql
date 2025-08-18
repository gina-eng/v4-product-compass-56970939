-- Corrigir a função is_internal_user para incluir o role 'user'
CREATE OR REPLACE FUNCTION public.is_internal_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
    SELECT EXISTS (
        SELECT 1 
        FROM public.org_members 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'staff', 'user')
    );
$function$