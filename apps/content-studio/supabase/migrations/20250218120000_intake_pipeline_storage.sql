-- Intake Pipeline v1: storage_prefix na projektu + project_files pro přehled souborů.
-- V Supabase Dashboard (Storage) vytvořte bucket "client-projects" (veřejný nebo s RLS dle potřeby).

-- 1) Přidat storage_prefix do projects (prefix v rámci bucketu client-projects: projects/<projectCode>/)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS storage_prefix text;

COMMENT ON COLUMN projects.storage_prefix IS 'Prefix v bucketu client-projects, např. projects/LCF-20250218-A3B9/';

-- 2) Tabulka project_files — seznam nahraných souborů (logo, fotky, PDF) pro admin přehled a download
CREATE TABLE IF NOT EXISTS project_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('logo', 'photo', 'manual')),
  original_name text,
  content_type text,
  size_bytes bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files (project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_kind ON project_files (project_id, kind);

ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access project_files" ON project_files FOR ALL USING (true);

COMMENT ON TABLE project_files IS 'Seznam souborů nahraných v rámci intake pipeline (logo, fotky, brand PDF).';
