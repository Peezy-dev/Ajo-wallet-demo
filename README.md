# Ajo Wallet Demo

A simple demo app showing a personal wallet + cooperative savings (Ajo) system built with _React + TypeScript + TailwindCSS_ and _Supabase_ (Auth + Postgres).

---

## Features

- Supabase Auth
- Wallet per user (wallets): balance, total_contributed, total_withdrawn
- Fund & Withdraw flows
- Ajo groups: create, list, join
- Admin KYC verification (stored on profiles.kyc_verified)
- Wallet auto-creation for new users

---

## Repo contents

- src/pages/DashboardShell.tsx — Wallet UI (fund/withdraw, next payout)
- src/pages/AjoGroupPage.tsx — Create / view Ajo groups + KYC toggle
- lib/supabaseClient.ts — Supabase initialization
- other standard React/TypeScript project files

---

## Environment variables

Create a .env.local (or .env) in the project root with the following:
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY

## Database schema / migrations (run in Supabase SQL Editor)

Run this full SQL (creates tables + profile trigger) — it is idempotent:

```sql
create extension if not exists "uuid-ossp";

-- Profiles (for KYC + admin flag)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  kyc_verified boolean default false,
  is_admin boolean default false,
  created_at timestamp default now()
);

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name) values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure handle_new_user();

-- Wallets
create table if not exists wallets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  balance numeric default 0,
  total_contributed numeric default 0,
  total_withdrawn numeric default 0,
  kyc_verified boolean default false,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Ajo Groups
create table if not exists ajo_groups (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  admin_id uuid references auth.users(id) on delete cascade,
  contribution_amount numeric not null,
  cycle_length_days int default 30,
  current_cycle int default 1,
  next_payout_date date,
  created_at timestamp default now()
);

-- Ajo Members
create table if not exists ajo_members (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid references ajo_groups(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  joined_at timestamp default now(),
  has_received_payout boolean default false
);

-- Ajo Cycles
create table if not exists ajo_cycles (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid references ajo_groups(id) on delete cascade,
  cycle_number int,
  payout_user_id uuid references auth.users(id),
  payout_amount numeric default 0,
  start_date date,
  end_date date,
  is_active boolean default true
);

##TEST ADMIN USERS
- IN supabase - auth -users - invite or sign up users
- example test accounts(create them in supabase or via sign up)
-make a test user an admin
  -run this sq  l (replace <ADMIN-USER-ID> with the user UUID shown in supabase auth)
  sql
  update profiles set is_admin = true
  kyc_verified = true where id = '<ADMIN-USER-ID>';
- if a user has  no wallet, the app a uto creates wallets on first loadd but you can also insert manually
sql
insert into wallets (user_id, balance, total_contributed, total_withdrawn)
values ('<USER_ID_HERE>')

## loCAL DEV install and run
git clone https://github.com/<your-username>/<repo>.git
cd <repo>
npm install
# add .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev

# create local repo if not already
git init
git add .
git commit -m "chore: initial commit - wallet + ajo"
# create remote on GitHub (or create repo on github.com and then:)
git remote add origin git@github.com:<your-username>/<repo>.git
git branch -M main
git push -u origin main

Troubleshooting
-If balance doesnt show confirm wallets row exist for the logged in user_id
(supabase table editor)
-If updates fail: check rls policies for the table
-If profile kyc toggle fails confirm profiles table exists and row for user exists

Credits
Built by Oyewale Precious Oluwaseun
```
