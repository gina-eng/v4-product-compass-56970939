-- Limpar dados inconsistentes na tabela profiles
DELETE FROM public.profiles 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Criar registos de org_members para todos os usuários que não têm
INSERT INTO public.org_members (user_id, role)
SELECT id, 'admin'
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM public.org_members)
ON CONFLICT (user_id, role) DO NOTHING;

-- Garantir que todos os usuários autenticados têm um perfil
INSERT INTO public.profiles (id, user_id, email, full_name)
SELECT 
    au.id,
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data ->> 'full_name', au.email)
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;