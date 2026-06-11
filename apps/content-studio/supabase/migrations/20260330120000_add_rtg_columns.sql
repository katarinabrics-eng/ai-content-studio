-- RTG sloupce pro client_projects: onboarding, plán, agent, platformy, Drive
ALTER TABLE client_projects
  ADD COLUMN IF NOT EXISTS agent_style text,
  ADD COLUMN IF NOT EXISTS platforms text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS topics text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS interval_days integer,
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS rtg_activated_at timestamptz,
  ADD COLUMN IF NOT EXISTS rtg_plan text CHECK (rtg_plan IN ('start', 'plus', 'pro')),
  ADD COLUMN IF NOT EXISTS google_drive_folder_id text;
