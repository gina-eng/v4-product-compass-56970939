
-- Drop old write policies that require auth and replace with public access

-- PRODUCTS
DROP POLICY IF EXISTS "products_write_service_only" ON public.products;
DROP POLICY IF EXISTS "products_insert_internal" ON public.products;
DROP POLICY IF EXISTS "products_update_internal" ON public.products;
DROP POLICY IF EXISTS "products_delete_internal" ON public.products;

CREATE POLICY "products_insert_public" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "products_update_public" ON public.products FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "products_delete_public" ON public.products FOR DELETE USING (true);

-- POSITIONS
DROP POLICY IF EXISTS "positions_write_service_only" ON public.positions;
DROP POLICY IF EXISTS "positions_insert_internal" ON public.positions;
DROP POLICY IF EXISTS "positions_update_internal" ON public.positions;
DROP POLICY IF EXISTS "positions_delete_internal" ON public.positions;

CREATE POLICY "positions_insert_public" ON public.positions FOR INSERT WITH CHECK (true);
CREATE POLICY "positions_update_public" ON public.positions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "positions_delete_public" ON public.positions FOR DELETE USING (true);

-- PRODUCT_POSITIONS
DROP POLICY IF EXISTS "product_positions_write_service_only" ON public.product_positions;
DROP POLICY IF EXISTS "product_positions_insert_internal" ON public.product_positions;
DROP POLICY IF EXISTS "product_positions_update_internal" ON public.product_positions;
DROP POLICY IF EXISTS "product_positions_delete_internal" ON public.product_positions;

CREATE POLICY "product_positions_insert_public" ON public.product_positions FOR INSERT WITH CHECK (true);
CREATE POLICY "product_positions_update_public" ON public.product_positions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "product_positions_delete_public" ON public.product_positions FOR DELETE USING (true);

-- TRAINING_MATERIALS
DROP POLICY IF EXISTS "training_materials_write_service_only" ON public.training_materials;
DROP POLICY IF EXISTS "training_materials_insert_internal" ON public.training_materials;
DROP POLICY IF EXISTS "training_materials_update_internal" ON public.training_materials;
DROP POLICY IF EXISTS "training_materials_delete_internal" ON public.training_materials;

CREATE POLICY "training_materials_insert_public" ON public.training_materials FOR INSERT WITH CHECK (true);
CREATE POLICY "training_materials_update_public" ON public.training_materials FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "training_materials_delete_public" ON public.training_materials FOR DELETE USING (true);

-- SITE_SETTINGS
DROP POLICY IF EXISTS "site_settings_write_service_only" ON public.site_settings;

CREATE POLICY "site_settings_insert_public" ON public.site_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "site_settings_update_public" ON public.site_settings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "site_settings_delete_public" ON public.site_settings FOR DELETE USING (true);

-- SUPPORT_MATERIALS
DROP POLICY IF EXISTS "support_materials_write_service_only" ON public.support_materials;

CREATE POLICY "support_materials_insert_public" ON public.support_materials FOR INSERT WITH CHECK (true);
CREATE POLICY "support_materials_update_public" ON public.support_materials FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "support_materials_delete_public" ON public.support_materials FOR DELETE USING (true);

-- ORG_MEMBERS
DROP POLICY IF EXISTS "org_members_write_service_only" ON public.org_members;

CREATE POLICY "org_members_insert_public" ON public.org_members FOR INSERT WITH CHECK (true);
CREATE POLICY "org_members_update_public" ON public.org_members FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "org_members_delete_public" ON public.org_members FOR DELETE USING (true);
