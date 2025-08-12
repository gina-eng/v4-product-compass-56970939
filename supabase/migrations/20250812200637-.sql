-- Restaurar função is_internal_user corrigida
CREATE OR REPLACE FUNCTION public.is_internal_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.org_members 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'staff')
    );
$$;

-- Política básica para permitir login e visualização de dados essenciais
CREATE POLICY IF NOT EXISTS "Allow authenticated users to view own org membership" 
ON public.org_members
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Política básica para visualizar perfis
CREATE POLICY IF NOT EXISTS "Allow authenticated users to view profiles" 
ON public.profiles
FOR SELECT 
USING (auth.role() = 'authenticated');