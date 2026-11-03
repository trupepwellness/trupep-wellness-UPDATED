-- TruPep moderated reviews — run ONCE in the Supabase SQL editor (not applied automatically).
-- Visitors may INSERT a review as "pending" and read only "approved" ones.
-- Store admins (rows in `admins`) may read, update and delete all reviews.
-- Photos live in the public `review-photos` bucket (5 MB limit, images only).

create table if not exists reviews (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name       text not null check (char_length(name) between 1 and 80),
  rating     int  not null check (rating between 1 and 5),
  body       text not null check (char_length(body) between 1 and 2000),
  photo_url  text check (photo_url is null or char_length(photo_url) <= 500),
  status     text not null default 'pending' check (status in ('pending','approved','denied'))
);

create index if not exists reviews_status_created_idx on reviews (status, created_at desc);

alter table reviews enable row level security;

drop policy if exists "Public can read approved reviews" on reviews;
create policy "Public can read approved reviews"
on reviews for select to anon, authenticated
using (status = 'approved');

drop policy if exists "Anyone can submit a pending review" on reviews;
create policy "Anyone can submit a pending review"
on reviews for insert to anon, authenticated
with check (status = 'pending');

drop policy if exists "Admins can read all reviews" on reviews;
create policy "Admins can read all reviews"
on reviews for select to authenticated
using (exists (select 1 from admins a where a.user_id = auth.uid()));

drop policy if exists "Admins can update reviews" on reviews;
create policy "Admins can update reviews"
on reviews for update to authenticated
using (exists (select 1 from admins a where a.user_id = auth.uid()))
with check (exists (select 1 from admins a where a.user_id = auth.uid()));

drop policy if exists "Admins can delete reviews" on reviews;
create policy "Admins can delete reviews"
on reviews for delete to authenticated
using (exists (select 1 from admins a where a.user_id = auth.uid()));

-- Photo bucket: public to read, anyone may upload, admins may delete.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('review-photos', 'review-photos', true, 5242880, array['image/png','image/jpeg','image/webp','image/gif'])
on conflict (id) do update
set public = true, file_size_limit = 5242880,
    allowed_mime_types = array['image/png','image/jpeg','image/webp','image/gif'];

drop policy if exists "Review photos are public" on storage.objects;
create policy "Review photos are public"
on storage.objects for select to anon, authenticated
using (bucket_id = 'review-photos');

drop policy if exists "Anyone can upload a review photo" on storage.objects;
create policy "Anyone can upload a review photo"
on storage.objects for insert to anon, authenticated
with check (bucket_id = 'review-photos');

drop policy if exists "Admins can delete review photos" on storage.objects;
create policy "Admins can delete review photos"
on storage.objects for delete to authenticated
using (bucket_id = 'review-photos' and exists (select 1 from admins a where a.user_id = auth.uid()));
