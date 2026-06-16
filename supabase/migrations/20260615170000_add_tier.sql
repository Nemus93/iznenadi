-- Add tier column for Phase 3A
ALTER TABLE surprises ADD COLUMN IF NOT EXISTS tier text NOT NULL DEFAULT 'basic';
