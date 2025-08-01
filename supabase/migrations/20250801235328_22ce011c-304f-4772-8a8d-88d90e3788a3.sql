-- Create enum types for product categories and status
CREATE TYPE public.categoria_produto AS ENUM ('saber', 'ter', 'executar', 'potencializar');
CREATE TYPE public.status_produto AS ENUM ('Disponível', 'Em produção', 'Em homologação');

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  produto TEXT NOT NULL,
  categoria categoria_produto NOT NULL,
  duracao TEXT NOT NULL,
  dono TEXT NOT NULL,
  valor TEXT NOT NULL,
  pitch BOOLEAN NOT NULL DEFAULT false,
  bpmn BOOLEAN NOT NULL DEFAULT false,
  playbook BOOLEAN NOT NULL DEFAULT false,
  icp BOOLEAN NOT NULL DEFAULT false,
  pricing BOOLEAN NOT NULL DEFAULT false,
  certificacao BOOLEAN NOT NULL DEFAULT false,
  pitch_url TEXT,
  bpmn_url TEXT,
  playbook_url TEXT,
  icp_url TEXT,
  pricing_url TEXT,
  certificacao_url TEXT,
  status status_produto NOT NULL DEFAULT 'Disponível',
  description TEXT NOT NULL,
  detailed_description TEXT NOT NULL,
  objetivos TEXT NOT NULL,
  spiced_data JSONB NOT NULL DEFAULT '{}',
  entregas TEXT NOT NULL,
  prerequisitos TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (since this is a product catalog)
CREATE POLICY "Products are viewable by everyone" 
ON public.products 
FOR SELECT 
USING (true);

-- For now, allow all authenticated users to manage products (you can restrict this later)
CREATE POLICY "Authenticated users can create products" 
ON public.products 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update products" 
ON public.products 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete products" 
ON public.products 
FOR DELETE 
TO authenticated
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_products_categoria ON public.products(categoria);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_dono ON public.products(dono);