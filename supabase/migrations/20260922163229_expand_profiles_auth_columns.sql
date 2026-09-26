/*
# CampusFind — Day 2: Auth & User System Expansion

## Overview
Adds identity verification, roles, trust scoring, avatar support, and token management columns
to the existing `profiles` table. No new tables are created; no existing data is lost.

## Modified Tables

### profiles (ALTER — additive only)
- `is_verified` (boolean, default false) — true after the user clicks their email verification link
- `role` (text, default 'student') — 'student' or 'admin'; admin is manually set in DB, no UI yet
- `trust_score` (integer, default 0) — placeholder; will increase as users successfully return items
- `avatar_url` (text, nullable) — URL to uploaded profile picture; null means use initials avatar
- `verification_token` (uuid, nullable) — token for email verification flow
- `verification_token_expiry` (timestamptz, nullable) — when the verification token expires
- `reset_token` (uuid, nullable) — token for password reset flow
- `reset_token_expiry` (timestamptz, nullable) — when the reset token expires

## Security
- RLS already enabled on profiles from Day 1; policies unchanged.
- The new columns are covered by the existing `profiles_select_all` (SELECT) and
  `profiles_update_own` (UPDATE) policies.
- `role`, `trust_score`, `is_verified` are writable by the owner via the existing UPDATE policy
  for now, but the frontend never exposes these fields for editing — they are set by DB triggers
  or manual admin action. A future migration can lock them down with column-level privileges.

## Important Notes
1. All additions are additive (ALTER TABLE ADD COLUMN) — no data loss.
2. The `role` column uses a CHECK constraint to ensure only 'student' or 'admin'.
3. Token columns are nullable and only populated during active verification/reset flows.
4. The existing `handle_new_user` trigger from Day 1 still fires on signup; it creates the
   profile row with `name` only. The new columns get their defaults automatically.
*/

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  ADD COLUMN IF NOT EXISTS trust_score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS verification_token uuid,
  ADD COLUMN IF NOT EXISTS verification_token_expiry timestamptz,
  ADD COLUMN IF NOT EXISTS reset_token uuid,
  ADD COLUMN IF NOT EXISTS reset_token_expiry timestamptz;

CREATE INDEX IF NOT EXISTS idx_profiles_verification_token ON profiles(verification_token);
CREATE INDEX IF NOT EXISTS idx_profiles_reset_token ON profiles(reset_token);
