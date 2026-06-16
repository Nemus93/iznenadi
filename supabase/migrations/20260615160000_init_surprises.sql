-- Iznenadi: surprises + photo storage

create table if not exists public.surprises (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  template text not null default 'love_message',
  payload jsonb not null,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now()
);

create index if not exists surprises_slug_idx on public.surprises (slug);

alter table public.surprises enable row level security;

create policy "Public read published surprises"
  on public.surprises
  for select
  using (status = 'published');

-- Storage bucket for surprise photos (public read)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'surprise-photos',
  'surprise-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

create policy "Public read surprise photos"
  on storage.objects
  for select
  using (bucket_id = 'surprise-photos');
