-- supabase_schema.sql

-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Table: profiles
create table public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  username text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS for profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Table: posts
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS for posts
alter table public.posts enable row level security;

create policy "Posts are viewable by everyone."
  on posts for select
  using ( true );

create policy "Authenticated users can insert posts"
  on posts for insert
  with check ( auth.role() = 'authenticated' and auth.uid() = author_id );

create policy "Users can update their own posts."
  on posts for update
  using ( auth.uid() = author_id );

create policy "Users can delete their own posts."
  on posts for delete
  using ( auth.uid() = author_id );

-- Function to handle new user signup
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;

-- Trigger to call handle_new_user after an insert to auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Table: comments
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS for comments
alter table public.comments enable row level security;

create policy "Comments are viewable by everyone."
  on comments for select
  using ( true );

create policy "Authenticated users can insert comments"
  on comments for insert
  with check ( auth.role() = 'authenticated' and auth.uid() = author_id );

create policy "Users can delete their own comments"
  on comments for delete
  using ( auth.uid() = author_id );
