-- TruPep Wellness: unified products table (catalog + inventory + COA + image)
-- Run in Supabase: Project > SQL Editor > New query > Run
-- Safe to re-run -- uses IF NOT EXISTS / ON CONFLICT throughout.

create table if not exists products (
  id text primary key,                   -- slug, e.g. "bpc157"
  name text not null,
  category text not null,
  description text,
  variants jsonb not null default '[]'::jsonb,   -- [{ "label": "10mg", "price": 65 }, ...]
  image_url text,
  stock_quantity integer not null default 0,
  low_stock_threshold integer not null default 5,
  batch_number text,
  coa_url text,
  coa_uploaded_at timestamptz,
  active boolean not null default true,   -- uncheck in admin to hide from the storefront without deleting
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_products_updated_at on products;
create trigger trg_products_updated_at
before update on products
for each row execute function set_updated_at();

-- Row Level Security: public can read everything (storefront filters to
-- active=true itself), only your logged-in admin session can write.
alter table products enable row level security;

drop policy if exists "Public can view products" on products;
create policy "Public can view products"
on products for select
to anon
using (true);

drop policy if exists "Authenticated users can manage products" on products;
create policy "Authenticated users can manage products"
on products for all
to authenticated
using (true)
with check (true);

-- If you already created the old `inventory` table from the previous setup,
-- this migrates stock/batch/COA data across, then you can drop it.
do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'inventory') then
    update products p
    set stock_quantity = i.stock_quantity,
        low_stock_threshold = i.low_stock_threshold,
        batch_number = i.batch_number,
        coa_url = i.coa_url,
        coa_uploaded_at = i.coa_uploaded_at
    from inventory i
    where i.product_id = p.id;
  end if;
end $$;

-- ── Storage buckets ────────────────────────────────────────────
-- COA PDFs (from the earlier build -- safe to re-run)
insert into storage.buckets (id, name, public)
values ('coa-documents', 'coa-documents', true)
on conflict (id) do nothing;

drop policy if exists "Public can read COA files" on storage.objects;
create policy "Public can read COA files"
on storage.objects for select to anon
using (bucket_id = 'coa-documents');

drop policy if exists "Authenticated users can upload COA files" on storage.objects;
create policy "Authenticated users can upload COA files"
on storage.objects for insert to authenticated
with check (bucket_id = 'coa-documents');

drop policy if exists "Authenticated users can update COA files" on storage.objects;
create policy "Authenticated users can update COA files"
on storage.objects for update to authenticated
using (bucket_id = 'coa-documents');

-- Product photos (new)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can read product images" on storage.objects;
create policy "Public can read product images"
on storage.objects for select to anon
using (bucket_id = 'product-images');

drop policy if exists "Authenticated users can upload product images" on storage.objects;
create policy "Authenticated users can upload product images"
on storage.objects for insert to authenticated
with check (bucket_id = 'product-images');

drop policy if exists "Authenticated users can update product images" on storage.objects;
create policy "Authenticated users can update product images"
on storage.objects for update to authenticated
using (bucket_id = 'product-images');

-- ── Seed: your current 25 products from data.jsx ─────────────────
-- Safe to re-run: on conflict does nothing, so it won't overwrite edits
-- you've since made in the admin dashboard.
insert into products (id, name, category, description, variants) values
('retatrutide','Retatrutide','Weight Management','Triple receptor GLP-1/GIP/glucagon agonist commonly researched for advanced metabolic support and body composition.','[{"label":"10mg","price":90},{"label":"20mg","price":130},{"label":"30mg","price":160}]'),
('tirzepatide','Tirzepatide','Weight Management','Dual GIP/GLP-1 receptor agonist commonly researched for metabolic health and body composition improvement.','[{"label":"20mg","price":90},{"label":"30mg","price":110}]'),
('5amino','5-Amino-1MQ','Weight Management','NNMT inhibitor commonly researched for fat cell metabolism activation and body recomposition support.','[{"label":"50mg","price":95}]'),
('bpc157','BPC-157','Recovery','Body protection compound commonly researched for tissue repair, gut lining integrity, and accelerated healing.','[{"label":"10mg","price":65},{"label":"20mg","price":85}]'),
('cagrilintide','Cagrilintide','Weight Management','Long-acting amylin analogue commonly researched for appetite regulation and sustained weight management.','[{"label":"5mg","price":65},{"label":"10mg","price":85}]'),
('cjcipamorelin','CJC No DAC / Ipamorelin','Performance','Synergistic GHRH and GHRP combination commonly researched for growth hormone optimization and recovery.','[{"label":"10mg","price":85}]'),
('epithalon','Epithalon','Anti-Aging','Tetrapeptide commonly researched for telomere elongation, circadian rhythm support, and longevity.','[{"label":"10mg","price":65}]'),
('hghfrag','HGH Fragment 176-191','Weight Management','Modified growth hormone fragment commonly researched for targeted lipolysis and fat metabolism.','[{"label":"5mg","price":65}]'),
('ghkcu','GHK-Cu','Aesthetics','Copper peptide commonly researched for collagen synthesis, skin regeneration, and wound healing.','[{"label":"100mg","price":85}]'),
('ipamorelin','Ipamorelin','Performance','Selective growth hormone releasing peptide commonly researched for GH release with a clean safety profile.','[{"label":"10mg","price":65}]'),
('kisspeptin','Kisspeptin','Performance','Neuropeptide commonly researched for LH/FSH regulation, hormonal balance, and reproductive health.','[{"label":"10mg","price":75}]'),
('klowblend','KLOW Blend','Peptide Blends','Proprietary metabolic blend commonly researched for comprehensive weight management and metabolic optimization.','[{"label":"80mg","price":150}]'),
('glowblend','GLOW Blend','Peptide Blends','Proprietary aesthetic blend commonly researched for skin health, hair quality, and overall appearance support.','[{"label":"70mg","price":130}]'),
('kpv','KPV Tripeptide','Recovery','Alpha-MSH derived tripeptide commonly researched for anti-inflammatory action and gut barrier support.','[{"label":"10mg","price":65}]'),
('lipoc','Lipo C with B12','Weight Management','Lipotropic compound with Vitamin B12 commonly researched for fat mobilization and energy metabolism.','[{"label":"10mL","price":95}]'),
('motsc','MOTS-C','Anti-Aging','Mitochondrial peptide commonly researched for metabolic flexibility, insulin sensitivity, and healthy aging.','[{"label":"10mg","price":90}]'),
('melanotanI','Melanotan I','Aesthetics','Alpha-MSH analogue commonly researched for skin pigmentation, UV photoprotection, and tanning.','[{"label":"10mg","price":75}]'),
('melanotanII','Melanotan II','Aesthetics','MSH analogue commonly researched for pigmentation, libido enhancement, and appetite suppression.','[{"label":"10mg","price":85}]'),
('nad','NAD+','Anti-Aging','Essential coenzyme commonly researched for cellular energy production, DNA repair, and cognitive support.','[{"label":"500mg","price":90},{"label":"1000mg","price":120}]'),
('pt141','PT-141','Aesthetics','Melanocortin receptor agonist commonly researched for sexual health, libido, and arousal support.','[{"label":"10mg","price":65}]'),
('selank','Selank','Cognitive','Anxiolytic peptide commonly researched for stress reduction, anxiety relief, and memory enhancement.','[{"label":"10mg","price":65}]'),
('semax','Semax','Cognitive','ACTH-derived nootropic peptide commonly researched for focus, neuroprotection, and mood stabilization.','[{"label":"10mg","price":65}]'),
('tesamorelin','Tesamorelin','Anti-Aging','GHRH analogue commonly researched for visceral fat reduction, IGF-1 stimulation, and metabolic health.','[{"label":"20mg","price":110}]'),
('tb500','TB-500','Recovery','Thymosin Beta-4 fragment commonly researched for injury recovery, flexibility, and tissue repair.','[{"label":"10mg","price":70}]'),
('bacwater','BAC Water','Accessories','Bacteriostatic water for safe reconstitution of lyophilized peptide research compounds.','[{"label":"30mL","price":18}]')
on conflict (id) do nothing;

-- ══════════════════════════════════════════════════════════════
-- Phase: Orders, Customers, Admins
-- ══════════════════════════════════════════════════════════════

-- Marks which Supabase Auth users are store admins (vs. regular
-- customer accounts, which use the same Auth system but aren't listed
-- here). Insert yourself after creating your admin login (see step 5
-- in SETUP.md) with:
--   insert into admins (user_id) select id from auth.users where email = 'you@example.com';
create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table admins enable row level security;
drop policy if exists "Admins can see the admin list" on admins;
create policy "Admins can see the admin list"
on admins for select to authenticated
using (exists (select 1 from admins a where a.user_id = auth.uid()));

-- One row per customer *account* (guests don't get a row here --
-- their contact info lives directly on their order instead).
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  email text,
  name text,
  phone text,
  created_at timestamptz not null default now()
);
alter table customers enable row level security;

drop policy if exists "Admins manage all customers" on customers;
create policy "Admins manage all customers"
on customers for all to authenticated
using (exists (select 1 from admins a where a.user_id = auth.uid()))
with check (exists (select 1 from admins a where a.user_id = auth.uid()));

drop policy if exists "Customers manage their own record" on customers;
create policy "Customers manage their own record"
on customers for all to authenticated
using (auth_user_id = auth.uid())
with check (auth_user_id = auth.uid());

-- One row per order, whether placed by a logged-in customer or a guest.
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,  -- null = guest order
  guest boolean not null default true,
  customer_name text,
  customer_email text,
  customer_phone text,
  street text, city text, state text, zip text,
  contact_pref text,
  items jsonb not null default '[]'::jsonb,   -- [{product_id, name, variant_label, price, qty}]
  subtotal numeric(10,2),
  discount_pct numeric(5,2) default 0,
  shipping_cost numeric(10,2) default 0,
  total numeric(10,2),
  promo_code text,
  payment_method text,                        -- filled in by admin once payment is received
  payment_status text not null default 'pending',      -- pending | paid | refunded
  fulfillment_status text not null default 'new',       -- new | processing | shipped | completed | cancelled
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_orders_updated_at on orders;
create trigger trg_orders_updated_at
before update on orders
for each row execute function set_updated_at();

alter table orders enable row level security;

drop policy if exists "Admins manage all orders" on orders;
create policy "Admins manage all orders"
on orders for all to authenticated
using (exists (select 1 from admins a where a.user_id = auth.uid()))
with check (exists (select 1 from admins a where a.user_id = auth.uid()));

-- Guests (not logged in) can place an order, but only as a guest row.
drop policy if exists "Guests can place guest orders" on orders;
create policy "Guests can place guest orders"
on orders for insert to anon
with check (customer_id is null);

-- Logged-in customers can place an order tied to their own account,
-- and view/re-check their own order history.
drop policy if exists "Customers can place their own orders" on orders;
create policy "Customers can place their own orders"
on orders for insert to authenticated
with check (
  customer_id is null
  or customer_id in (select id from customers where auth_user_id = auth.uid())
);

drop policy if exists "Customers can view their own orders" on orders;
create policy "Customers can view their own orders"
on orders for select to authenticated
using (customer_id in (select id from customers where auth_user_id = auth.uid()));
