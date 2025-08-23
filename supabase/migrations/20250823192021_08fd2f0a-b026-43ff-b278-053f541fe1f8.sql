-- Add RLS policies to allow internal users to modify positions
CREATE POLICY "positions_insert_internal" 
ON public.positions 
FOR INSERT 
WITH CHECK (is_internal_user());

CREATE POLICY "positions_update_internal" 
ON public.positions 
FOR UPDATE 
USING (is_internal_user()) 
WITH CHECK (is_internal_user());

CREATE POLICY "positions_delete_internal" 
ON public.positions 
FOR DELETE 
USING (is_internal_user());