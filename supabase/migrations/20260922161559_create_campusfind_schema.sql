/*
# CampusFind — Lost & Found Platform Schema

## Overview
Creates the full database schema for CampusFind, a Lost & Found platform for CMRIT college students.
This migration sets up tables for user profiles, lost items, found items, and claims (claims table is created now but unused until Phase 2).

## New Tables

### profiles
- `id` (uuid, PK, references auth.users) — links to Supabase Auth
- `name` (text, not null) — full name of the student
- `student_id` (text, nullable) — optional college student ID
- `phone` (text, nullable) — optional phone number
- `created_at` (timestamptz, default now)

### lost_items
- `id` (uuid, PK)
- `user_id` (uuid, FK → auth.users, default auth.uid()) — owner of the report
- `item_name` (text, not null) — name/title of the lost item
- `category` (text, not null) — category (Electronics, Books, Clothing, etc.)
- `description` (text, nullable) — detailed description
- `date_lost` (date, not null) — date the item was lost
- `location_lost` (text, not null) — where on campus it was lost
- `image_url` (text, nullable) — URL to item image (placeholder for now)
- `status` (text, default 'active') — 'active', 'reclaimed', 'archived'
- `created_at` (timestamptz, default now)

### found_items
- `id` (uuid, PK)
- `user_id` (uuid, FK → auth.users, default auth.uid()) — owner of the report
- `item_name` (text, not null) — name/title of the found item
- `category` (text, not null) — category
- `description` (text, nullable) — detailed description
- `date_found` (date, not null) — date the item was found
- `location_found` (text, not null) — where on campus it was found
- `image_url` (text, nullable) — URL to item image
- `status` (text, default 'active') — 'active', 'reclaimed', 'archived'
- `created_at` (timestamptz, default now)

### claims
- `id` (uuid, PK)
- `lost_item_id` (uuid, FK → lost_items, nullable) — the lost item being claimed
- `found_item_id` (uuid, FK → found_items, nullable) — the found item being claimed
- `claimant_id` (uuid, FK → auth.users, default auth.uid()) — user making the claim
- `status` (text, default 'pending') — 'pending', 'approved', 'rejected'
- `created_at` (timestamptz, default now)

## Security (RLS)
- All tables have RLS enabled.
- profiles: users can read/update only their own profile; anyone authenticated can read profiles (to see who reported an item).
- lost_items: anyone authenticated can SELECT (browse listings); only owner can INSERT/UPDATE/DELETE.
- found_items: same as lost_items.
- claims: owner can SELECT/INSERT/UPDATE/DELETE their own claims.

## Important Notes
1. The `claims` table is created now for forward compatibility but will not be used until Phase 2.
2. `user_id` columns default to `auth.uid()` so frontend inserts that omit `user_id` still work.
3. Profiles are readable by all authenticated users so item listings can show reporter names.
*/

-- ===================== PROFILES =====================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  student_id text,
  phone text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ===================== LOST ITEMS =====================
CREATE TABLE IF NOT EXISTS lost_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  category text NOT NULL,
  description text,
  date_lost date NOT NULL,
  location_lost text NOT NULL,
  image_url text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lost_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lost_items_select_all" ON lost_items;
CREATE POLICY "lost_items_select_all"
  ON lost_items FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "lost_items_insert_own" ON lost_items;
CREATE POLICY "lost_items_insert_own"
  ON lost_items FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "lost_items_update_own" ON lost_items;
CREATE POLICY "lost_items_update_own"
  ON lost_items FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "lost_items_delete_own" ON lost_items;
CREATE POLICY "lost_items_delete_own"
  ON lost_items FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_lost_items_user_id ON lost_items(user_id);
CREATE INDEX IF NOT EXISTS idx_lost_items_category ON lost_items(category);
CREATE INDEX IF NOT EXISTS idx_lost_items_status ON lost_items(status);

-- ===================== FOUND ITEMS =====================
CREATE TABLE IF NOT EXISTS found_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  category text NOT NULL,
  description text,
  date_found date NOT NULL,
  location_found text NOT NULL,
  image_url text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE found_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "found_items_select_all" ON found_items;
CREATE POLICY "found_items_select_all"
  ON found_items FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "found_items_insert_own" ON found_items;
CREATE POLICY "found_items_insert_own"
  ON found_items FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "found_items_update_own" ON found_items;
CREATE POLICY "found_items_update_own"
  ON found_items FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "found_items_delete_own" ON found_items;
CREATE POLICY "found_items_delete_own"
  ON found_items FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_found_items_user_id ON found_items(user_id);
CREATE INDEX IF NOT EXISTS idx_found_items_category ON found_items(category);
CREATE INDEX IF NOT EXISTS idx_found_items_status ON found_items(status);

-- ===================== CLAIMS (Phase 2 — unused now) =====================
CREATE TABLE IF NOT EXISTS claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lost_item_id uuid REFERENCES lost_items(id) ON DELETE CASCADE,
  found_item_id uuid REFERENCES found_items(id) ON DELETE CASCADE,
  claimant_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "claims_select_own" ON claims;
CREATE POLICY "claims_select_own"
  ON claims FOR SELECT
  TO authenticated USING (auth.uid() = claimant_id);

DROP POLICY IF EXISTS "claims_insert_own" ON claims;
CREATE POLICY "claims_insert_own"
  ON claims FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = claimant_id);

DROP POLICY IF EXISTS "claims_update_own" ON claims;
CREATE POLICY "claims_update_own"
  ON claims FOR UPDATE
  TO authenticated USING (auth.uid() = claimant_id) WITH CHECK (auth.uid() = claimant_id);

DROP POLICY IF EXISTS "claims_delete_own" ON claims;
CREATE POLICY "claims_delete_own"
  ON claims FOR DELETE
  TO authenticated USING (auth.uid() = claimant_id);

-- ===================== TRIGGER: auto-create profile on signup =====================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (new.id, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
