-- TruPep database discount codes — run ONCE in the Supabase SQL editor.
-- Codes live in `discount_codes` (not in the site code). The table has RLS on
-- and NO public policies, so nobody can read or change it through the API.
-- The checkout talks to it only through two security-definer functions:
--   get_promo(code)          -> is this code valid right now, and what is it worth?
--   redeem_promo(code, order)-> burns the code (row deleted) so it can never be used again.
-- Single-use codes are deleted the moment an order is placed with them.
-- The order itself keeps the record (orders.promo_code + orders.discount_amount).

create table if not exists public.discount_codes (
  code        text primary key,
  kind        text not null check (kind in ('flat', 'pct')),
  amount      numeric(10, 2) not null check (amount > 0),
  note        text,
  active      boolean not null default true,
  single_use  boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.discount_codes enable row level security;
-- Intentionally no policies: direct API access is denied for anon + authenticated.

create or replace function public.get_promo(p_code text)
returns table (valid boolean, kind text, amount numeric, reason text)
language plpgsql security definer set search_path = public as $$
declare r public.discount_codes%rowtype;
begin
  select * into r from public.discount_codes where code = upper(trim(p_code));
  if not found then
    return query select false, null::text, null::numeric, 'not_found'::text;
    return;
  end if;
  if not r.active then
    return query select false, r.kind, r.amount, 'inactive'::text;
    return;
  end if;
  return query select true, r.kind, r.amount, null::text;
end;
$$;

create or replace function public.redeem_promo(p_code text, p_order text)
returns boolean
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  delete from public.discount_codes
   where code = upper(trim(p_code)) and active and single_use;
  get diagnostics n = row_count;
  return n > 0;
end;
$$;

grant execute on function public.get_promo(text) to anon, authenticated;
grant execute on function public.redeem_promo(text, text) to anon, authenticated;

-- Orders remember the exact dollars a promo took off (promo_code already exists).
alter table public.orders add column if not exists discount_amount numeric(10, 2);

-- Tia Sabrina's review reward: $15 off, one time only.
insert into public.discount_codes (code, kind, amount, note)
values ('THANKSTIA15', 'flat', 15, 'Tia Sabrina — $15 review reward, 2026-11-03')
on conflict (code) do nothing;
