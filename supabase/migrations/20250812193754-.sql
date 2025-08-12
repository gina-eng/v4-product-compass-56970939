-- =====================================================
-- MIGRAÇÃO DE SEGURANÇA ROBUSTA - RLS DENY-BY-DEFAULT
-- =====================================================

BEGIN;

-- Criar tabela de roles organizacionais se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'org_members') THEN
        CREATE TABLE public.org_members (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            role text NOT NULL CHECK (role IN ('admin', 'staff', 'user')),
            created_at timestamp with time zone DEFAULT now() NOT NULL,
            updated_at timestamp with time zone DEFAULT now() NOT NULL,
            UNIQUE(user_id, role)
        );
        
        -- Índice para performance das políticas RLS
        CREATE INDEX idx_org_members_user_id_role ON public.org_members(user_id, role);
        
        COMMENT ON TABLE public.org_members IS 'Papéis organizacionais dos usuários para controle de acesso';
    END IF;
END $$;

-- =====================================================
-- CONFIGURAÇÃO DA TABELA PROFILES
-- =====================================================

-- Garantir que profiles tem estrutura correta
DO $$
BEGIN
    -- Verificar se a coluna id existe e é do tipo correto
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'id' 
        AND data_type = 'uuid'
    ) THEN
        -- Se a tabela usa user_id como PK, renomear para id
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'profiles' 
            AND column_name = 'user_id'
        ) THEN
            ALTER TABLE public.profiles RENAME COLUMN user_id TO id;
        ELSE
            -- Adicionar coluna id se não existir
            ALTER TABLE public.profiles ADD COLUMN id uuid PRIMARY KEY DEFAULT gen_random_uuid();
        END IF;
    END IF;
END $$;

-- Ativar e forçar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- Remover todas as políticas antigas da tabela profiles
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_record.policyname);
    END LOOP;
END $$;

-- Criar políticas restritivas para profiles
CREATE POLICY "profiles_read_self" ON public.profiles
    FOR SELECT 
    USING (id = auth.uid());

CREATE POLICY "profiles_update_self" ON public.profiles
    FOR UPDATE 
    USING (id = auth.uid()) 
    WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_read_service" ON public.profiles
    FOR SELECT 
    USING (auth.role() = 'service_role');

CREATE POLICY "profiles_write_service" ON public.profiles
    FOR ALL 
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Comentários explicativos
COMMENT ON POLICY "profiles_read_self" ON public.profiles IS 'Usuário pode ler apenas seu próprio perfil';
COMMENT ON POLICY "profiles_update_self" ON public.profiles IS 'Usuário pode atualizar apenas seu próprio perfil';
COMMENT ON POLICY "profiles_read_service" ON public.profiles IS 'Service role pode ler todos os perfis';
COMMENT ON POLICY "profiles_write_service" ON public.profiles IS 'Service role pode fazer todas as operações';

-- =====================================================
-- CONFIGURAÇÃO DAS TABELAS DE NEGÓCIO
-- =====================================================

-- Função auxiliar para verificar papéis internos
CREATE OR REPLACE FUNCTION public.is_internal_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.org_members 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'staff')
    );
$$;

COMMENT ON FUNCTION public.is_internal_user() IS 'Verifica se o usuário atual tem papel interno (admin/staff)';

-- Configurar RLS para tabela products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products FORCE ROW LEVEL SECURITY;

-- Remover políticas antigas de products
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'products' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.products', policy_record.policyname);
    END LOOP;
END $$;

-- Criar políticas restritivas para products
CREATE POLICY "products_read_internal" ON public.products
    FOR SELECT 
    USING (
        auth.role() = 'service_role' 
        OR public.is_internal_user()
    );

CREATE POLICY "products_write_service_only" ON public.products
    FOR ALL 
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

COMMENT ON POLICY "products_read_internal" ON public.products IS 'Leitura apenas para service_role ou usuários internos (admin/staff)';
COMMENT ON POLICY "products_write_service_only" ON public.products IS 'Escrita apenas para service_role';

-- Configurar RLS para tabela positions
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions FORCE ROW LEVEL SECURITY;

-- Remover políticas antigas de positions
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'positions' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.positions', policy_record.policyname);
    END LOOP;
END $$;

-- Criar políticas restritivas para positions
CREATE POLICY "positions_read_internal" ON public.positions
    FOR SELECT 
    USING (
        auth.role() = 'service_role' 
        OR public.is_internal_user()
    );

CREATE POLICY "positions_write_service_only" ON public.positions
    FOR ALL 
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

COMMENT ON POLICY "positions_read_internal" ON public.positions IS 'Leitura apenas para service_role ou usuários internos (admin/staff)';
COMMENT ON POLICY "positions_write_service_only" ON public.positions IS 'Escrita apenas para service_role';

-- Configurar RLS para tabela site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings FORCE ROW LEVEL SECURITY;

-- Remover políticas antigas de site_settings
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'site_settings' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.site_settings', policy_record.policyname);
    END LOOP;
END $$;

-- Criar políticas restritivas para site_settings
CREATE POLICY "site_settings_read_internal" ON public.site_settings
    FOR SELECT 
    USING (
        auth.role() = 'service_role' 
        OR public.is_internal_user()
    );

CREATE POLICY "site_settings_write_service_only" ON public.site_settings
    FOR ALL 
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

COMMENT ON POLICY "site_settings_read_internal" ON public.site_settings IS 'Leitura apenas para service_role ou usuários internos (admin/staff)';
COMMENT ON POLICY "site_settings_write_service_only" ON public.site_settings IS 'Escrita apenas para service_role';

-- Configurar RLS para outras tabelas sensíveis
DO $$
DECLARE
    table_name text;
    tables_to_secure text[] := ARRAY['product_positions', 'support_materials', 'training_materials'];
    policy_record RECORD;
BEGIN
    FOREACH table_name IN ARRAY tables_to_secure
    LOOP
        -- Ativar RLS
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
        EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', table_name);
        
        -- Remover políticas antigas
        FOR policy_record IN 
            EXECUTE format('SELECT policyname FROM pg_policies WHERE tablename = %L AND schemaname = ''public''', table_name)
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_record.policyname, table_name);
        END LOOP;
        
        -- Criar políticas restritivas
        EXECUTE format('CREATE POLICY "%s_read_internal" ON public.%I FOR SELECT USING (auth.role() = ''service_role'' OR public.is_internal_user())', table_name, table_name);
        EXECUTE format('CREATE POLICY "%s_write_service_only" ON public.%I FOR ALL USING (auth.role() = ''service_role'') WITH CHECK (auth.role() = ''service_role'')', table_name, table_name);
    END LOOP;
END $$;

-- =====================================================
-- TRIGGER PARA CRIAÇÃO AUTOMÁTICA DE PROFILES
-- =====================================================

-- Atualizar função de criação de perfil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Validar domínio de email
    IF NOT (NEW.email LIKE '%@v4company.com') THEN
        RAISE EXCEPTION 'Apenas emails do domínio @v4company.com são permitidos';
    END IF;
    
    -- Inserir perfil usando ID do usuário
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Adicionar papel padrão
    INSERT INTO public.org_members (user_id, role)
    VALUES (NEW.id, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RETURN NEW;
END;
$$;

-- Recriar trigger se necessário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- VIEW PÚBLICA SANITIZADA (OPCIONAL)
-- =====================================================

CREATE OR REPLACE VIEW public.public_profiles_view AS
SELECT 
    id,
    full_name,
    created_at
FROM public.profiles;

-- RLS na view
ALTER VIEW public.public_profiles_view SET (security_invoker = on);

COMMENT ON VIEW public.public_profiles_view IS 'View pública sanitizada dos perfis sem informações sensíveis';

-- =====================================================
-- ATIVAR RLS EM ORG_MEMBERS
-- =====================================================

ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members FORCE ROW LEVEL SECURITY;

-- Políticas para org_members
CREATE POLICY "org_members_read_self" ON public.org_members
    FOR SELECT 
    USING (user_id = auth.uid());

CREATE POLICY "org_members_read_service" ON public.org_members
    FOR SELECT 
    USING (auth.role() = 'service_role');

CREATE POLICY "org_members_write_service_only" ON public.org_members
    FOR ALL 
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

COMMENT ON POLICY "org_members_read_self" ON public.org_members IS 'Usuário pode ver apenas seus próprios papéis';
COMMENT ON POLICY "org_members_read_service" ON public.org_members IS 'Service role pode ver todos os papéis';
COMMENT ON POLICY "org_members_write_service_only" ON public.org_members IS 'Apenas service role pode gerenciar papéis';

COMMIT;

-- =====================================================
-- SCRIPT DE TESTE DE SEGURANÇA
-- =====================================================

/*
-- TESTES DE SEGURANÇA (executar separadamente)

-- 1. Teste como usuário anônimo
SET ROLE anon;
SELECT auth.role(); -- Deve retornar 'anon'

-- Deve falhar - sem acesso a dados sensíveis
SELECT COUNT(*) FROM public.products; -- Erro esperado
SELECT COUNT(*) FROM public.positions; -- Erro esperado
SELECT COUNT(*) FROM public.site_settings; -- Erro esperado
SELECT COUNT(*) FROM public.profiles; -- Erro esperado

-- 2. Teste como usuário autenticado comum
-- (Simular jwt.claims)
SELECT set_config('request.jwt.claims', '{"sub":"user-uuid-here","role":"authenticated","email":"user@v4company.com"}', true);
SET ROLE authenticated;

-- Deve funcionar apenas para próprio profile
SELECT * FROM public.profiles WHERE id = 'user-uuid-here'::uuid; -- OK
SELECT * FROM public.profiles WHERE id != 'user-uuid-here'::uuid; -- Deve retornar vazio

-- Deve falhar para dados de negócio
SELECT COUNT(*) FROM public.products; -- Erro esperado
SELECT COUNT(*) FROM public.positions; -- Erro esperado

-- 3. Teste como admin/staff
-- (Primeiro inserir papel de admin)
SET ROLE service_role;
INSERT INTO public.org_members (user_id, role) VALUES ('admin-uuid-here'::uuid, 'admin');

-- Simular admin logado
SELECT set_config('request.jwt.claims', '{"sub":"admin-uuid-here","role":"authenticated","email":"admin@v4company.com"}', true);
SET ROLE authenticated;

-- Deve funcionar para leitura de dados de negócio
SELECT COUNT(*) FROM public.products; -- OK
SELECT COUNT(*) FROM public.positions; -- OK
SELECT COUNT(*) FROM public.site_settings; -- OK

-- Deve falhar para escrita
INSERT INTO public.products (produto, dono, valor, description, como_vendo, o_que_entrego, duracao, categoria) 
VALUES ('Teste', 'Admin', '1000', 'Teste', 'Teste', 'Teste', '1 semana', 'consulting'); -- Erro esperado

-- 4. Teste como service_role
SET ROLE service_role;

-- Deve funcionar tudo
SELECT COUNT(*) FROM public.products; -- OK
SELECT COUNT(*) FROM public.positions; -- OK
SELECT COUNT(*) FROM public.profiles; -- OK

-- Deve permitir escrita
INSERT INTO public.products (produto, dono, valor, description, como_vendo, o_que_entrego, duracao, categoria) 
VALUES ('Teste Service', 'Service', '1000', 'Teste', 'Teste', 'Teste', '1 semana', 'consulting'); -- OK

-- Limpeza do teste
DELETE FROM public.products WHERE produto = 'Teste Service';

-- Reset
RESET ROLE;
*/

-- =====================================================
-- ROLLBACK SEGURO (se necessário)
-- =====================================================

/*
-- ATENÇÃO: Execute apenas se precisar reverter as mudanças

BEGIN;

-- Desativar RLS forçado (manter RLS ativo)
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.products FORCE ROW LEVEL SECURITY;
ALTER TABLE public.positions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings FORCE ROW LEVEL SECURITY;
ALTER TABLE public.org_members FORCE ROW LEVEL SECURITY;

-- Recriar políticas permissivas antigas (adapte conforme necessário)
-- ... (adicione as políticas antigas aqui se precisar)

COMMIT;
*/