-- products
DROP POLICY IF EXISTS products_read_v4 ON public.products;
DROP POLICY IF EXISTS products_insert_v4 ON public.products;
DROP POLICY IF EXISTS products_update_v4 ON public.products;
DROP POLICY IF EXISTS products_delete_v4 ON public.products;
CREATE POLICY products_public_select ON public.products FOR SELECT TO public USING (true);
CREATE POLICY products_public_insert ON public.products FOR INSERT TO public WITH CHECK (true);
CREATE POLICY products_public_update ON public.products FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY products_public_delete ON public.products FOR DELETE TO public USING (true);

-- product_positions
DROP POLICY IF EXISTS product_positions_read_v4 ON public.product_positions;
DROP POLICY IF EXISTS product_positions_insert_v4 ON public.product_positions;
DROP POLICY IF EXISTS product_positions_update_v4 ON public.product_positions;
DROP POLICY IF EXISTS product_positions_delete_v4 ON public.product_positions;
CREATE POLICY product_positions_public_select ON public.product_positions FOR SELECT TO public USING (true);
CREATE POLICY product_positions_public_insert ON public.product_positions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY product_positions_public_update ON public.product_positions FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY product_positions_public_delete ON public.product_positions FOR DELETE TO public USING (true);

-- positions
DROP POLICY IF EXISTS positions_read_v4 ON public.positions;
DROP POLICY IF EXISTS positions_insert_v4 ON public.positions;
DROP POLICY IF EXISTS positions_update_v4 ON public.positions;
DROP POLICY IF EXISTS positions_delete_v4 ON public.positions;
CREATE POLICY positions_public_select ON public.positions FOR SELECT TO public USING (true);
CREATE POLICY positions_public_insert ON public.positions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY positions_public_update ON public.positions FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY positions_public_delete ON public.positions FOR DELETE TO public USING (true);