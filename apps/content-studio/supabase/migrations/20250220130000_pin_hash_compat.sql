-- Kompatibilita: access_pin_hash (fallback), project_pin_expires_at, access_pin_expires_at.

ALTER TABLE projects ADD COLUMN IF NOT EXISTS access_pin_hash text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_pin_expires_at timestamptz;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS access_pin_expires_at timestamptz;

-- Backfill: access_pin_hash = project_pin_hash, expires = now + 30 days pro existující záznamy
UPDATE projects
SET
  access_pin_hash = COALESCE(access_pin_hash, project_pin_hash),
  project_pin_expires_at = COALESCE(project_pin_expires_at, now() + interval '30 days'),
  access_pin_expires_at = COALESCE(access_pin_expires_at, now() + interval '30 days')
WHERE project_pin_hash IS NOT NULL AND (access_pin_hash IS NULL OR project_pin_expires_at IS NULL);
