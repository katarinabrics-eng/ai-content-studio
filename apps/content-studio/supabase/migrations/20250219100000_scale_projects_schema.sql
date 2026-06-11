-- Škálování: project_brief (1:1), project_admin_meta (admin_only), timeline, feedback, deliverables.
-- PIN vždy hashovaný (project_pin_hash). Admin_only v samostatné tabulce + RLS.

-- 1) Status enum (doporučené hodnoty + closed)
DO $$ BEGIN
  CREATE TYPE project_status_enum AS ENUM (
    'processing_data',
    'in_production',
    'draft_ready',
    'revision',
    'final_ready',
    'closed'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2) Tabulka project_brief (1:1 k project) — required + optional pole z formuláře
CREATE TABLE IF NOT EXISTS project_brief (
  project_id uuid PRIMARY KEY REFERENCES projects (id) ON DELETE CASCADE,
  -- required (rychlý start)
  plan_id text NOT NULL DEFAULT 'basic',
  brand_name text NOT NULL DEFAULT '',
  industry text NOT NULL DEFAULT '',
  communication_goal text NOT NULL DEFAULT '',
  platforms text[] NOT NULL DEFAULT '{}',
  tone_of_voice text NOT NULL DEFAULT '',
  website_or_profile text NOT NULL DEFAULT '',
  -- optional (pokročilé)
  client_email text,
  note text DEFAULT '',
  target_audience text DEFAULT '',
  offers text DEFAULT '',
  forbidden_words text DEFAULT '',
  preferred_style text DEFAULT '',
  preferred_cta text DEFAULT '',
  logo_url text DEFAULT '',
  brand_colors text DEFAULT '',
  brand_fonts text DEFAULT '',
  image_refs text DEFAULT '',
  source_url text DEFAULT '',
  brand_pdf_url text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_brief_plan_id ON project_brief (plan_id);

-- 3) project_admin_meta — jen admin, RLS později
CREATE TABLE IF NOT EXISTS project_admin_meta (
  project_id uuid PRIMARY KEY REFERENCES projects (id) ON DELETE CASCADE,
  assigned_curator_id uuid,
  brief_completeness int NOT NULL DEFAULT 0 CHECK (brief_completeness >= 0 AND brief_completeness <= 100),
  missing_fields text[] NOT NULL DEFAULT '{}',
  ai_confidence int CHECK (ai_confidence IS NULL OR (ai_confidence >= 0 AND ai_confidence <= 100)),
  qa_score int CHECK (qa_score IS NULL OR (qa_score >= 0 AND qa_score <= 100)),
  internal_notes text,
  risk_flags text[] NOT NULL DEFAULT '{}',
  sla_due_at timestamptz,
  revision_count int NOT NULL DEFAULT 0,
  last_ai_run_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4) project_timeline — co klient vidí
CREATE TABLE IF NOT EXISTS project_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  event_type text NOT NULL,
  public_message text DEFAULT '',
  visible_to_client boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_project_timeline_project_id ON project_timeline (project_id);
CREATE INDEX IF NOT EXISTS idx_project_timeline_created_at ON project_timeline (created_at DESC);

-- 5) project_feedback — schválení / námitky
DO $$ BEGIN CREATE TYPE feedback_created_by_enum AS ENUM ('client', 'admin'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE feedback_type_enum AS ENUM ('approval', 'objection'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS project_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  type feedback_type_enum NOT NULL,
  message text,
  created_by feedback_created_by_enum NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_project_feedback_project_id ON project_feedback (project_id);

-- 6) project_deliverables — drafty / finály
DO $$ BEGIN CREATE TYPE deliverable_kind_enum AS ENUM ('draft', 'final'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS project_deliverables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  version int NOT NULL DEFAULT 1,
  kind deliverable_kind_enum NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_project_deliverables_project_id ON project_deliverables (project_id);

-- 7) Úpravy projects: přidat client_email, assigned_curator_id; přejmenovat pin_hash -> project_pin_hash
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_email text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS assigned_curator_id uuid;

-- Migrace dat: email -> client_email
UPDATE projects SET client_email = email WHERE client_email IS NULL AND email IS NOT NULL;

-- Přejmenování pin_hash na project_pin_hash (pokud existuje pin_hash)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'pin_hash'
  ) THEN
    ALTER TABLE projects RENAME COLUMN pin_hash TO project_pin_hash;
  END IF;
END $$;

-- Rozšíření status o 'closed' (pokud je CHECK)
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE projects ADD CONSTRAINT projects_status_check CHECK (status IN (
  'PROCESSING_DATA', 'IN_PRODUCTION', 'DRAFT_READY', 'REVISION', 'FINAL_READY', 'CLOSED',
  'processing_data', 'in_production', 'draft_ready', 'revision', 'final_ready', 'closed'
));

-- 8) Backfill project_brief z existujících projects (brand, obor, cil, …) PŘED dropem sloupců
INSERT INTO project_brief (
  project_id, plan_id, brand_name, industry, communication_goal, platforms, tone_of_voice, website_or_profile,
  client_email, note
)
SELECT
  p.id,
  COALESCE(p.plan_id, 'basic'),
  COALESCE(p.brand, ''),
  COALESCE(p.obor, ''),
  COALESCE(p.cil, ''),
  CASE
    WHEN p.sit IS NULL OR p.sit = '' THEN ARRAY[]::text[]
    ELSE ARRAY[p.sit]
  END,
  COALESCE(p.tonalita, ''),
  '',
  p.email,
  COALESCE(p.poznamka, '')
FROM projects p
WHERE NOT EXISTS (SELECT 1 FROM project_brief pb WHERE pb.project_id = p.id)
ON CONFLICT (project_id) DO NOTHING;

-- Backfill z project_brief jsonb (pokud sloupec existuje a má data)
DO $$
DECLARE
  has_jsonb boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'project_brief'
  ) INTO has_jsonb;
  IF has_jsonb THEN
    UPDATE project_brief pb SET
      target_audience = (p.project_brief->>'cilova_skupina'),
      offers = (p.project_brief->>'nabidky_produkty'),
      forbidden_words = (p.project_brief->>'zakazana_slova'),
      preferred_style = (p.project_brief->>'preferovany_styl'),
      preferred_cta = (p.project_brief->>'preferovana_cta'),
      logo_url = (p.project_brief->'brand_assets'->>'logo_url'),
      brand_colors = (p.project_brief->'brand_assets'->>'barvy'),
      brand_fonts = (p.project_brief->'brand_assets'->>'fonty'),
      image_refs = (p.project_brief->'brand_assets'->>'obrazky'),
      source_url = (p.project_brief->>'url_pdf_autofill'),
      updated_at = now()
    FROM projects p
    WHERE p.id = pb.project_id AND p.project_brief IS NOT NULL AND p.project_brief != '{}'::jsonb;
  END IF;
END $$;

-- Backfill project_admin_meta
INSERT INTO project_admin_meta (project_id)
SELECT id FROM projects
ON CONFLICT (project_id) DO NOTHING;

-- 9) Odstranit staré sloupce z projects (až po backfillu)
ALTER TABLE projects DROP COLUMN IF EXISTS brand;
ALTER TABLE projects DROP COLUMN IF EXISTS obor;
ALTER TABLE projects DROP COLUMN IF EXISTS cil;
ALTER TABLE projects DROP COLUMN IF EXISTS sit;
ALTER TABLE projects DROP COLUMN IF EXISTS tonalita;
ALTER TABLE projects DROP COLUMN IF EXISTS poznamka;
ALTER TABLE projects DROP COLUMN IF EXISTS email;
ALTER TABLE projects DROP COLUMN IF EXISTS project_brief;

-- RLS: project_admin_meta jen pro admin (service role obchází RLS; pro anon/authenticated můžeme přidat policy)
ALTER TABLE project_brief ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_admin_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_deliverables ENABLE ROW LEVEL SECURITY;

-- Policy: project_brief čitelné pro klienta jen přes svůj projekt (session); zatím povolíme vše pro service role
CREATE POLICY "Service role full access project_brief" ON project_brief FOR ALL USING (true);
CREATE POLICY "Service role full access project_admin_meta" ON project_admin_meta FOR ALL USING (true);
CREATE POLICY "Service role full access project_timeline" ON project_timeline FOR ALL USING (true);
CREATE POLICY "Service role full access project_feedback" ON project_feedback FOR ALL USING (true);
CREATE POLICY "Service role full access project_deliverables" ON project_deliverables FOR ALL USING (true);

COMMENT ON TABLE project_brief IS '1:1 brief od klienta (required + optional pole).';
COMMENT ON TABLE project_admin_meta IS 'Admin-only metadata (completeness, scores, SLA). Klient nikdy nečte.';
COMMENT ON COLUMN projects.project_pin_hash IS 'Hash PIN (nikdy plain PIN).';
