-- Garantir função de atualização de timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Garantir existência da tabela org_members em ambientes legados
CREATE TABLE IF NOT EXISTS public.org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'staff')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.org_members
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS idx_org_members_user_role_unique
ON public.org_members (user_id, role);

ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members are viewable by everyone" ON public.org_members;
CREATE POLICY "Org members are viewable by everyone"
ON public.org_members
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Anyone can create org members" ON public.org_members;
CREATE POLICY "Anyone can create org members"
ON public.org_members
FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update org members" ON public.org_members;
CREATE POLICY "Anyone can update org members"
ON public.org_members
FOR UPDATE
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can delete org members" ON public.org_members;
CREATE POLICY "Anyone can delete org members"
ON public.org_members
FOR DELETE
USING (true);

DROP TRIGGER IF EXISTS update_org_members_updated_at ON public.org_members;
CREATE TRIGGER update_org_members_updated_at
BEFORE UPDATE ON public.org_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de Sistemas Operacionais usada no frontend/admin
CREATE TABLE IF NOT EXISTS public.systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_sistema TEXT NOT NULL,
  valor_entregue TEXT NOT NULL,
  link_redirecionamento TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.systems ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Systems are viewable by everyone" ON public.systems;
CREATE POLICY "Systems are viewable by everyone"
ON public.systems
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Anyone can create systems" ON public.systems;
CREATE POLICY "Anyone can create systems"
ON public.systems
FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update systems" ON public.systems;
CREATE POLICY "Anyone can update systems"
ON public.systems
FOR UPDATE
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can delete systems" ON public.systems;
CREATE POLICY "Anyone can delete systems"
ON public.systems
FOR DELETE
USING (true);

DROP TRIGGER IF EXISTS update_systems_updated_at ON public.systems;
CREATE TRIGGER update_systems_updated_at
BEFORE UPDATE ON public.systems
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_systems_nome_sistema ON public.systems (nome_sistema);
