-- TruPep: site_settings table for Admin › Site Look (branding: words, fonts, text size).
-- One row (id = 1). Public can read (the storefront applies the branding);
-- only admins can write (is_admin()).
create table if not exists public.site_settings (
  id int primary key,
  branding jsonb not null default '{}'::jsonb
);
insert into public.site_settings (id, branding) values (1, '{}'::jsonb)
on conflict (id) do nothing;
alter table public.site_settings enable row level security;
drop policy if exists "site_settings public read" on public.site_settings;
create policy "site_settings public read" on public.site_settings
  for select using (true);
drop policy if exists "site_settings admin write" on public.site_settings;
create policy "site_settings admin write" on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());
select id, branding from public.site_settings;
