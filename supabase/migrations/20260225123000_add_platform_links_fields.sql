ALTER TABLE public.platforms
ADD COLUMN IF NOT EXISTS forum_url text,
ADD COLUMN IF NOT EXISTS request_form_url text;
