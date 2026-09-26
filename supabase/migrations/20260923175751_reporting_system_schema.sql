/*
# CampusFind — Day 3: Reporting System Schema Updates

## Overview
Adds reference codes, multi-image support, current holder notes, expiry tracking,
and an expanded status enum to the lost_items and found_items tables.

## Modified Tables

### lost_items (ALTER — additive)
- `reference_code` (text, unique) — short code like CF-LST-2931 for tracking
- `image_urls` (text[], default '{}') — up to 3 image URLs
- `contact_preference` (text, default 'in_app') — 'in_app' or 'show_phone'
- `expires_at` (timestamptz, nullable) — auto-calculated 30 days from creation
- Status CHECK constraint expanded: active, matched, resolved, expired

### found_items (ALTER — additive)
- `reference_code` (text, unique) — short code like CF-FND-2931
- `image_urls` (text[], default '{}') — up to 3 image URLs
- `current_holder_note` (text, nullable) — where the item is kept
- `good_faith_confirmed` (boolean, default false) — honesty checkbox
- `expires_at` (timestamptz, nullable) — auto-calculated 30 days from creation
- Status CHECK constraint expanded: active, matched, resolved, expired

## Security
- RLS already enabled; existing policies cover new columns.
- reference_code has a unique index for lookups.

## Important Notes
1. All changes are additive — no data loss.
2. The old `image_url` column is kept for backward compatibility; new code uses `image_urls[]`.
3. A trigger sets expires_at on insert (30 days from now).
4. A scheduled function marks items as expired when expires_at < now() — called from the app on read.
*/

-- ===== LOST ITEMS =====
ALTER TABLE lost_items
  ADD COLUMN IF NOT EXISTS reference_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS contact_preference text DEFAULT 'in_app',
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- Drop old constraint if exists, add expanded one
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'lost_items_status_check'
  ) THEN
    ALTER TABLE lost_items DROP CONSTRAINT lost_items_status_check;
  END IF;
END $$;

ALTER TABLE lost_items
  ADD CONSTRAINT lost_items_status_check CHECK (status IN ('active', 'matched', 'resolved', 'expired'));

CREATE INDEX IF NOT EXISTS idx_lost_items_reference_code ON lost_items(reference_code);
CREATE INDEX IF NOT EXISTS idx_lost_items_expires_at ON lost_items(expires_at);

-- ===== FOUND ITEMS =====
ALTER TABLE found_items
  ADD COLUMN IF NOT EXISTS reference_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS current_holder_note text,
  ADD COLUMN IF NOT EXISTS good_faith_confirmed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'found_items_status_check'
  ) THEN
    ALTER TABLE found_items DROP CONSTRAINT found_items_status_check;
  END IF;
END $$;

ALTER TABLE found_items
  ADD CONSTRAINT found_items_status_check CHECK (status IN ('active', 'matched', 'resolved', 'expired'));

CREATE INDEX IF NOT EXISTS idx_found_items_reference_code ON found_items(reference_code);
CREATE INDEX IF NOT EXISTS idx_found_items_expires_at ON found_items(expires_at);

-- ===== TRIGGER: set reference_code + expires_at on insert =====
CREATE OR REPLACE FUNCTION generate_lost_item_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.reference_code IS NULL THEN
    NEW.reference_code := 'CF-LST-' || lpad(floor(random() * 10000)::text, 4, '0');
  END IF;
  IF NEW.expires_at IS NULL THEN
    NEW.expires_at := now() + interval '30 days';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION generate_found_item_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.reference_code IS NULL THEN
    NEW.reference_code := 'CF-FND-' || lpad(floor(random() * 10000)::text, 4, '0');
  END IF;
  IF NEW.expires_at IS NULL THEN
    NEW.expires_at := now() + interval '30 days';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_lost_item_insert ON lost_items;
CREATE TRIGGER on_lost_item_insert
  BEFORE INSERT ON lost_items
  FOR EACH ROW EXECUTE FUNCTION generate_lost_item_code();

DROP TRIGGER IF EXISTS on_found_item_insert ON found_items;
CREATE TRIGGER on_found_item_insert
  BEFORE INSERT ON found_items
  FOR EACH ROW EXECUTE FUNCTION generate_found_item_code();

-- ===== FUNCTION: expire old items =====
CREATE OR REPLACE FUNCTION expire_old_items()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE lost_items SET status = 'expired'
  WHERE status = 'active' AND expires_at < now();

  UPDATE found_items SET status = 'expired'
  WHERE status = 'active' AND expires_at < now();
END;
$$;
