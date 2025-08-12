-- Drop the existing constraint
ALTER TABLE training_materials DROP CONSTRAINT training_materials_type_check;

-- Add the updated constraint to include 'treinamento'
ALTER TABLE training_materials ADD CONSTRAINT training_materials_type_check 
CHECK (type = ANY (ARRAY['comercial'::text, 'operacional'::text, 'treinamento'::text]));