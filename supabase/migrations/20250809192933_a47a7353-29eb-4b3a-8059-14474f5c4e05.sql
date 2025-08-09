-- Adicionar coluna para indicar o formato do material (gravado ou físico)
ALTER TABLE training_materials 
ADD COLUMN formato text CHECK (formato IN ('gravado', 'material')) DEFAULT 'material';