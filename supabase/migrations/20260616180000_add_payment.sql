-- Payment columns for Stripe Checkout (Phase 3D)
ALTER TABLE surprises
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'free'
    CHECK (payment_status IN ('free', 'pending', 'paid', 'failed')),
  ADD COLUMN IF NOT EXISTS price_paid integer,
  ADD COLUMN IF NOT EXISTS stripe_session_id text;

CREATE INDEX IF NOT EXISTS surprises_stripe_session_idx ON surprises (stripe_session_id);
