-- Remover duplicados na tabela profiles mantendo apenas o mais recente
WITH duplicates AS (
    SELECT id, 
           ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
    FROM public.profiles
)
DELETE FROM public.profiles 
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);

-- Inserir dados em org_members para usuários que não têm
INSERT INTO public.org_members (user_id, role)
SELECT p.user_id, 'admin'
FROM public.profiles p
WHERE p.user_id NOT IN (SELECT user_id FROM public.org_members)
ON CONFLICT (user_id, role) DO NOTHING;