-- One-time access tokens pro přímý vstup do projektu (obcházení kód+PIN v test mode).

CREATE TABLE IF NOT EXISTS project_access_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_project_access_tokens_token_hash ON project_access_tokens (token_hash);
CREATE INDEX IF NOT EXISTS idx_project_access_tokens_project_id ON project_access_tokens (project_id);
CREATE INDEX IF NOT EXISTS idx_project_access_tokens_expires_at ON project_access_tokens (expires_at);
