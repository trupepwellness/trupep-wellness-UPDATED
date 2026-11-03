-- ── PER-SIZE PRODUCT PHOTOS (2026-11-03) ──────────────────────
-- Each size (variant) gets its own vial photo so the picture on the
-- product card / detail page matches the strength the customer picks.
-- Photos already live in the product-images bucket, named
-- <product-id>-<label>.jpg (e.g. bpc157-20mg.jpg) — the same pattern
-- the product's main image_url already uses. This only writes the
-- matching URL into each variant's jsonb; nothing else changes.
-- Run once in the Supabase SQL Editor (project gapzzxkllpusfvwgtawj).

update public.products p
set variants = (
  select jsonb_agg(
    v || jsonb_build_object(
      'image',
      regexp_replace(p.image_url, '[^/]+$', p.id || '-' || lower(v->>'label') || '.jpg')
    )
    order by ord
  )
  from jsonb_array_elements(p.variants) with ordinality as t(v, ord)
)
where p.id in ('bpc157', 'cagrilintide', 'nad', 'retatrutide', 'tirzepatide')
  and p.image_url is not null;

-- Verify: every variant of those five products should now carry an image.
-- select id, variants from public.products
-- where id in ('bpc157','cagrilintide','nad','retatrutide','tirzepatide');
