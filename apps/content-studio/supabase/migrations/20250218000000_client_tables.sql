-- Clients, access links, jobs, notifications (magic link + onboarding + status workflow)
-- Run in Supabase SQL Editor or via supabase db push

-- clients
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text NOT NULL DEFAULT '',
  tariff text NOT NULL DEFAULT 'standard',
  priority integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clients_email ON clients (email);

-- client_access_links (hashed token, one-time use, expiry)
CREATE TABLE IF NOT EXISTS client_access_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients (id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'expired', 'revoked')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_client_access_links_token_hash ON client_access_links (token_hash);
CREATE INDEX IF NOT EXISTS idx_client_access_links_client_id ON client_access_links (client_id);
CREATE INDEX IF NOT EXISTS idx_client_access_links_expires_at ON client_access_links (expires_at);

-- client_jobs (week_key e.g. 2025-W08, status workflow)
CREATE TABLE IF NOT EXISTS client_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients (id) ON DELETE CASCADE,
  week_key text NOT NULL,
  status text NOT NULL DEFAULT 'paid' CHECK (status IN (
    'paid', 'onboarding_pending', 'onboarding_submitted', 'ai_processing',
    'curator_review', 'ready_for_approval', 'approved', 'delivered', 'scheduled',
    'client_changes_requested'
  )),
  due_at timestamptz,
  priority integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, week_key)
);

CREATE INDEX IF NOT EXISTS idx_client_jobs_client_id ON client_jobs (client_id);
CREATE INDEX IF NOT EXISTS idx_client_jobs_status ON client_jobs (status);
CREATE INDEX IF NOT EXISTS idx_client_jobs_week_key ON client_jobs (week_key);

-- client_notifications (email hooks log)
CREATE TABLE IF NOT EXISTS client_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients (id) ON DELETE CASCADE,
  type text NOT NULL,
  channel text NOT NULL DEFAULT 'email' CHECK (channel IN ('email', 'in_app')),
  payload jsonb NOT NULL DEFAULT '{}',
  sent_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_notifications_client_id ON client_notifications (client_id);
CREATE INDEX IF NOT EXISTS idx_client_notifications_type ON client_notifications (type);

-- RLS: enable if you use anon key for client; with service role we bypass RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_access_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: service role bypasses; add policies for client access via token later if needed
-- For now all access is server-side with service role.
