create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null check (char_length(btrim(nickname)) between 1 and 30),
  bio text not null default '' check (char_length(bio) <= 200),
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null default '' check (char_length(body) <= 2000),
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  storage_path text not null,
  sort_order integer not null check (sort_order >= 0 and sort_order < 9),
  created_at timestamptz not null default now(),
  unique (post_id, sort_order)
);

create index if not exists posts_visible_created_at_idx
  on public.posts(created_at desc)
  where deleted_at is null;

create index if not exists posts_author_visible_created_at_idx
  on public.posts(author_id, created_at desc)
  where deleted_at is null;

create index if not exists post_images_post_sort_idx
  on public.post_images(post_id, sort_order);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row
  execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  default_nickname text;
begin
  default_nickname := nullif(split_part(coalesce(new.email, ''), '@', 1), '');

  insert into public.profiles (id, nickname)
  values (new.id, left(coalesce(default_nickname, 'hiker'), 30))
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_images enable row level security;

drop policy if exists "profiles are publicly readable" on public.profiles;
create policy "profiles are publicly readable"
  on public.profiles for select
  using (true);

drop policy if exists "users insert own profile" on public.profiles;
create policy "users insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "visible posts are readable" on public.posts;
create policy "visible posts are readable"
  on public.posts for select
  using (deleted_at is null or auth.uid() = author_id);

drop policy if exists "users insert own posts" on public.posts;
create policy "users insert own posts"
  on public.posts for insert
  with check (auth.uid() = author_id);

drop policy if exists "users update own posts" on public.posts;
create policy "users update own posts"
  on public.posts for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

drop policy if exists "visible post images are readable" on public.post_images;
create policy "visible post images are readable"
  on public.post_images for select
  using (
    exists (
      select 1
      from public.posts
      where posts.id = post_images.post_id
        and (posts.deleted_at is null or posts.author_id = auth.uid())
    )
  );

drop policy if exists "post authors insert images" on public.post_images;
create policy "post authors insert images"
  on public.post_images for insert
  with check (
    exists (
      select 1
      from public.posts
      where posts.id = post_images.post_id
        and posts.author_id = auth.uid()
    )
  );

drop policy if exists "post authors delete images" on public.post_images;
create policy "post authors delete images"
  on public.post_images for delete
  using (
    exists (
      select 1
      from public.posts
      where posts.id = post_images.post_id
        and posts.author_id = auth.uid()
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'images',
  'images',
  true,
  10485760,
  array['image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "images are publicly readable" on storage.objects;
create policy "images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'images');

drop policy if exists "users upload own images" on storage.objects;
create policy "users upload own images"
  on storage.objects for insert
  with check (
    bucket_id = 'images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users update own images" on storage.objects;
create policy "users update own images"
  on storage.objects for update
  using (
    bucket_id = 'images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users delete own images" on storage.objects;
create policy "users delete own images"
  on storage.objects for delete
  using (
    bucket_id = 'images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
