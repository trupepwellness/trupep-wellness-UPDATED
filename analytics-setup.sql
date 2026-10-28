-- TruPep anonymous analytics — run ONCE in the Supabase SQL editor (not applied automatically).
-- Anyone may INSERT an event; only store admins (rows in `admins`) may read.
-- Events carry NO personal data: event type, item slug, a cleaned search term, and
-- non-personal context (random per-tab session code, language, phone/desktop).

create table if not exists site_events (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  event_type  text not null check (char_length(event_type) <= 40),
  item_slug   text check (item_slug is null or char_length(item_slug) <= 60),
  search_term text check (search_term is null or char_length(search_term) <= 40),
  meta        jsonb not null default '{}'::jsonb check (pg_column_size(meta) <= 512)
);

create index if not exists site_events_created_idx on site_events (created_at desc);
create index if not exists site_events_type_idx    on site_events (event_type, created_at desc);

alter table site_events enable row level security;

drop policy if exists "Anyone can log an anonymous event" on site_events;
create policy "Anyone can log an anonymous event"
on site_events for insert to anon, authenticated
with check (true);

drop policy if exists "Admins can read events" on site_events;
create policy "Admins can read events"
on site_events for select to authenticated
using (exists (select 1 from admins a where a.user_id = auth.uid()));

-- Optional housekeeping: delete events older than 13 months.
-- delete from site_events where created_at < now() - interval '13 months';
