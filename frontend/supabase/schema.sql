-- ========================================================
-- Medrella HMS: Supabase Authentication & RBAC Schema
-- Run this in your Supabase Project -> SQL Editor
-- ========================================================

-- 1. Profiles Table (Extends auth.users with medical HMS roles)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  email text not null,
  role text not null check (role in ('PATIENT', 'DOCTOR', 'ADMIN')) default 'PATIENT',
  doctor_id text null,
  patient_id text null,
  avatar_url text null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Policy: Authenticated users can view all profiles
create policy "Authenticated users can view profiles"
  on public.profiles for select
  to authenticated
  using (true);

-- Policy: Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- 3. Automatic Profile Provisioning Trigger on User Sign Up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role, avatar_url, patient_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'PATIENT'),
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'),
    'pat_' || substr(md5(random()::text), 1, 6)
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
