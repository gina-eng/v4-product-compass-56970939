-- Remover políticas restritivas atuais e criar políticas mais permissivas temporariamente
DROP POLICY IF EXISTS "org_members_read_self" ON public.org_members;
DROP POLICY IF EXISTS "profiles_read_self" ON public.profiles;

-- Política temporária para permitir que usuários autenticados vejam org_members
CREATE POLICY "authenticated_users_can_view_org_members" 
ON public.org_members
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Política temporária para permitir que usuários autenticados vejam todos os perfis
CREATE POLICY "authenticated_users_can_view_profiles" 
ON public.profiles
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Garantir que a função is_internal_user está correta
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