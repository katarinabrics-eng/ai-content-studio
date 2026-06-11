-- Test mode: projects (no payment). Run in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id text NOT NULL DEFAULT 'basic',
  brand text NOT NULL DEFAULT '',
  obor text NOT NULL DEFAULT '',
  cil text NOT NULL DEFAULT '',
  sit text NOT NULL DEFAULT '',
  tonalita text NOT NULL DEFAULT '',
  poznamka text NOT NULL DEFAULT '',
  email text,
  project_code text,
  pin_hash text,
  magic_token_hash text,
  status text NOT NULL DEFAULT 'PROCESSING_DATA' CHECK (status IN (
    'PROCESSING_DATA', 'IN_PRODUCTION', 'DRAFT_READY', 'REVISION', 'FINAL_READY'
  )),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_project_code ON projects (project_code) WHERE project_code IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_magic_token_hash ON projects (magic_token_hash) WHERE magic_token_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects (status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects (created_at DESC);

CREATE TABLE IF NOT EXISTS project_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_project_sessions_token_hash ON project_sessions (token_hash);
CREATE INDEX IF NOT EXISTS idx_project_sessions_expires_at ON project_sessions (expires_at);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_sessions ENABLE ROW LEVEL SECURITY;
