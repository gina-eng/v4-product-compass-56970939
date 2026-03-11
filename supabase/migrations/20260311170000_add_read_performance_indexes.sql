-- Read-performance indexes for high-frequency admin and portfolio queries.

CREATE INDEX IF NOT EXISTS idx_product_positions_product_id
  ON public.product_positions (product_id);

CREATE INDEX IF NOT EXISTS idx_product_positions_position_id
  ON public.product_positions (position_id);

CREATE INDEX IF NOT EXISTS idx_products_updated_at
  ON public.products (updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_products_created_at
  ON public.products (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_positions_nome
  ON public.positions (nome);

CREATE INDEX IF NOT EXISTS idx_support_materials_created_at
  ON public.support_materials (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tier_wtp_definitions_sort_order
  ON public.tier_wtp_definitions (sort_order);
