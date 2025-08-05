-- Create table to link products with positions and allocated hours
CREATE TABLE public.product_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  position_id UUID NOT NULL REFERENCES public.positions(id) ON DELETE CASCADE,
  horas_alocadas NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, position_id)
);

-- Enable RLS
ALTER TABLE public.product_positions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Product positions are viewable by everyone" 
ON public.product_positions 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create product positions" 
ON public.product_positions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update product positions" 
ON public.product_positions 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete product positions" 
ON public.product_positions 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_product_positions_updated_at
BEFORE UPDATE ON public.product_positions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();