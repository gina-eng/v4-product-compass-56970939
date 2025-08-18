
-- Habilitar RLS (idempotente)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_positions ENABLE ROW LEVEL SECURITY;

-- PRODUCTS: permitir escrita para usuários internos (authenticated + is_internal_user)

DROP POLICY IF EXISTS products_insert_internal ON public.products;
CREATE POLICY products_insert_internal
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (public.is_internal_user());

DROP POLICY IF EXISTS products_update_internal ON public.products;
CREATE POLICY products_update_internal
ON public.products
FOR UPDATE
TO authenticated
USING (public.is_internal_user())
WITH CHECK (public.is_internal_user());

DROP POLICY IF EXISTS products_delete_internal ON public.products;
CREATE POLICY products_delete_internal
ON public.products
FOR DELETE
TO authenticated
USING (public.is_internal_user());

-- PRODUCT_POSITIONS: permitir escrita para usuários internos

DROP POLICY IF EXISTS product_positions_insert_internal ON public.product_positions;
CREATE POLICY product_positions_insert_internal
ON public.product_positions
FOR INSERT
TO authenticated
WITH CHECK (public.is_internal_user());

DROP POLICY IF EXISTS product_positions_update_internal ON public.product_positions;
CREATE POLICY product_positions_update_internal
ON public.product_positions
FOR UPDATE
TO authenticated
USING (public.is_internal_user())
WITH CHECK (public.is_internal_user());

DROP POLICY IF EXISTS product_positions_delete_internal ON public.product_positions;
CREATE POLICY product_positions_delete_internal
ON public.product_positions
FOR DELETE
TO authenticated
USING (public.is_internal_user());

-- Trigger updated_at para products

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgrelid = 'public.products'::regclass 
      AND tgname = 'set_products_updated_at'
  ) THEN
    DROP TRIGGER set_products_updated_at ON public.products;
  END IF;
END$$;

CREATE TRIGGER set_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger updated_at para product_positions

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgrelid = 'public.product_positions'::regclass 
      AND tgname = 'set_product_positions_updated_at'
  ) THEN
    DROP TRIGGER set_product_positions_updated_at ON public.product_positions;
  END IF;
END$$;

CREATE TRIGGER set_product_positions_updated_at
BEFORE UPDATE ON public.product_positions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
