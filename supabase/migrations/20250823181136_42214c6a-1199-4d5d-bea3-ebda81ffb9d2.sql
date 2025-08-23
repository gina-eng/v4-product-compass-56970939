-- Adicionar campo para o segundo SPICED no products
ALTER TABLE products 
ADD COLUMN spiced_data_2 jsonb DEFAULT '{}'::jsonb;