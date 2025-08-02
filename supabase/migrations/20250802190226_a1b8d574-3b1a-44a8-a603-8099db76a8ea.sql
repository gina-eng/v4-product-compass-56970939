-- Create table for positions and costs
CREATE TABLE public.positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  investimento_total DECIMAL(10, 2) NOT NULL,
  cph DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;

-- Create policies for positions access
CREATE POLICY "Positions are viewable by everyone" 
ON public.positions 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create positions" 
ON public.positions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update positions" 
ON public.positions 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete positions" 
ON public.positions 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_positions_updated_at
BEFORE UPDATE ON public.positions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();