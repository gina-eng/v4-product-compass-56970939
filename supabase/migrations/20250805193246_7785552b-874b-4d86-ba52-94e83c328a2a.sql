-- Add case name fields to products table
ALTER TABLE public.products 
ADD COLUMN case_1_name text,
ADD COLUMN case_2_name text;