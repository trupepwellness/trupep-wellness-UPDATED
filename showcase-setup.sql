-- TruPep homepage showcase picker (run once in the Supabase SQL editor).
-- Adds the flag the homepage reads and the admin Products tab toggles,
-- and seeds the same four peptides that were previously hardcoded.
alter table public.products add column if not exists showcase boolean not null default false;
update public.products set showcase = true where id in ('retatrutide', 'bpc157', 'nad', 'tb500');
