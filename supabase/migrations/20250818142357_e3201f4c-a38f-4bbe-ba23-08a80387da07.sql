-- Corrigir a função handle_new_user para usar user_id corretamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    -- Validar domínio de email
    IF NOT (NEW.email LIKE '%@v4company.com') THEN
        RAISE EXCEPTION 'Apenas emails do domínio @v4company.com são permitidos';
    END IF;
    
    -- Inserir perfil usando user_id (corrigido)
    INSERT INTO public.profiles (user_id, email, full_name)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Adicionar papel padrão
    INSERT INTO public.org_members (user_id, role)
    VALUES (NEW.id, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RETURN NEW;
END;
$function$