
-- Products: allow anonymous read
CREATE POLICY "products_read_public" ON public.products FOR SELECT USING (true);

-- Positions: allow anonymous read
CREATE POLICY "positions_read_public" ON public.positions FOR SELECT USING (true);

-- Product Positions: allow anonymous read
CREATE POLICY "product_positions_read_public" ON public.product_positions FOR SELECT USING (true);

-- Profiles: allow anonymous read
CREATE POLICY "profiles_read_public" ON public.profiles FOR SELECT USING (true);

-- Site Settings: allow anonymous read
CREATE POLICY "site_settings_read_public" ON public.site_settings FOR SELECT USING (true);

-- Support Materials: allow anonymous read
CREATE POLICY "support_materials_read_public" ON public.support_materials FOR SELECT USING (true);

-- Training Materials: allow anonymous read
CREATE POLICY "training_materials_read_public" ON public.training_materials FOR SELECT USING (true);

-- Org Members: allow anonymous read
CREATE POLICY "org_members_read_public" ON public.org_members FOR SELECT USING (true);
