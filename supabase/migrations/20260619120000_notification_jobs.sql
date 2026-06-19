-- SMS notification jobs + recipient phone (UnlockPhone Phase 5A)

ALTER TABLE surprises
  ADD COLUMN IF NOT EXISTS recipient_phone text;

CREATE TABLE IF NOT EXISTS notification_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  surprise_id uuid NOT NULL REFERENCES surprises(id) ON DELETE CASCADE,
  sequence_index integer NOT NULL,
  body text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
  provider_message_id text,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notification_jobs_pending_idx
  ON notification_jobs (scheduled_at)
  WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS custom_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  description text NOT NULL,
  occasion text,
  budget text,
  deadline text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewed', 'quoted', 'declined')),
  created_at timestamptz NOT NULL DEFAULT now()
);
