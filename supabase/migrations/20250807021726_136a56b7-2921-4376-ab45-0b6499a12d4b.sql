-- Create training materials table
CREATE TABLE public.training_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('comercial', 'operacional')),
  url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.training_materials ENABLE ROW LEVEL SECURITY;

-- Create policies for training materials
CREATE POLICY "Training materials are viewable by everyone" 
ON public.training_materials 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create training materials" 
ON public.training_materials 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update training materials" 
ON public.training_materials 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete training materials" 
ON public.training_materials 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_training_materials_updated_at
BEFORE UPDATE ON public.training_materials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();