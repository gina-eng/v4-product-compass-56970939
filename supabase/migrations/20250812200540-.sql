-- Restaurar configurações básicas de RLS e políticas essenciais

-- Garantir existência da tabela org_members para evitar falhas em ambientes novos
CREATE TABLE IF NOT EXISTS public.org_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'staff')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON public.org_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_role ON public.org_members(role);

DROP TRIGGER IF EXISTS update_org_members_updated_at ON public.org_members;
CREATE TRIGGER update_org_members_updated_at
BEFORE UPDATE ON public.org_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Verificar se as políticas básicas existem para as tabelas principais
DO $$
BEGIN
    -- Política básica para profiles (permitir visualização e edição do próprio perfil)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Users can view own profile'
    ) THEN
        CREATE POLICY "Users can view own profile" ON public.profiles
        FOR SELECT USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" ON public.profiles
        FOR UPDATE USING (auth.uid() = id);
    END IF;

    -- Política básica para products (permitir visualização para usuários autenticados)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'products' AND policyname = 'Authenticated users can view products'
    ) THEN
        CREATE POLICY "Authenticated users can view products" ON public.products
        FOR SELECT USING (auth.role() = 'authenticated');
    END IF;

    -- Política básica para org_members (permitir visualização para usuários autenticados)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'org_members' AND policyname = 'Authenticated users can view org members'
    ) THEN
        CREATE POLICY "Authenticated users can view org members" ON public.org_members
        FOR SELECT USING (auth.role() = 'authenticated');
    END IF;

    -- Política básica para site_settings (permitir visualização para usuários autenticados)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'site_settings' AND policyname = 'Authenticated users can view settings'
    ) THEN
        CREATE POLICY "Authenticated users can view settings" ON public.site_settings
        FOR SELECT USING (auth.role() = 'authenticated');
    END IF;

    -- Garantir que a função is_internal_user existe e está correta
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

END $$;
