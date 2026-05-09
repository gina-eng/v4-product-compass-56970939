ALTER TABLE public.cases DROP COLUMN owner_user_id;
ALTER TABLE public.cases ADD COLUMN filled_at timestamp with time zone DEFAULT now();