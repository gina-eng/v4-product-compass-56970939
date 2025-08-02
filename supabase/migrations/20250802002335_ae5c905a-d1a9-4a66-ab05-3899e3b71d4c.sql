
-- Atualizar as políticas RLS para permitir operações sem autenticação
DROP POLICY IF EXISTS "Authenticated users can create products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON public.products;

-- Criar novas políticas que permitem operações para todos os usuários
CREATE POLICY "Anyone can create products" 
  ON public.products 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update products" 
  ON public.products 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Anyone can delete products" 
  ON public.products 
  FOR DELETE 
  USING (true);
