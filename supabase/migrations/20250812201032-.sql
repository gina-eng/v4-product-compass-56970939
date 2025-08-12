-- Corrigir dados inconsistentes na tabela profiles
-- O user_id deve corresponder ao id do auth.users

UPDATE public.profiles 
SET user_id = id 
WHERE user_id != id;

-- Inserir dados em org_members para todos os usuários que não têm
INSERT INTO public.org_members (user_id, role)
SELECT id, 'admin'
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM public.org_members)
ON CONFLICT (user_id, role) DO NOTHING;