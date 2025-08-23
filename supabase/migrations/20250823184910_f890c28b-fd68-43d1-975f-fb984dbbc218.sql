-- Adicionar policies para operações específicas de usuários internos na tabela training_materials
CREATE POLICY "training_materials_insert_internal" 
ON public.training_materials 
FOR INSERT 
WITH CHECK (is_internal_user());

CREATE POLICY "training_materials_update_internal" 
ON public.training_materials 
FOR UPDATE 
USING (is_internal_user())
WITH CHECK (is_internal_user());

CREATE POLICY "training_materials_delete_internal" 
ON public.training_materials 
FOR DELETE 
USING (is_internal_user());