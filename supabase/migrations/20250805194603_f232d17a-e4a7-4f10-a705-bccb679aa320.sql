-- Create support_materials table
CREATE TABLE public.support_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_arquivo TEXT NOT NULL,
  url_direcionamento TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.support_materials ENABLE ROW LEVEL SECURITY;

-- Create policies for support materials
CREATE POLICY "Support materials are viewable by everyone" 
ON public.support_materials 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create support materials" 
ON public.support_materials 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update support materials" 
ON public.support_materials 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete support materials" 
ON public.support_materials 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_support_materials_updated_at
BEFORE UPDATE ON public.support_materials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();