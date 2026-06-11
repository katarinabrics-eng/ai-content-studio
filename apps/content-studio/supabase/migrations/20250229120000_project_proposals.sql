-- Návrhy příspěvků dle strategie: formát (FB/IG/LinkedIn/leták/carousel), text + popis vizuálu, výběr pro klienta.

CREATE TABLE IF NOT EXISTS public.project_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  format text NOT NULL CHECK (format IN ('facebook', 'instagram', 'linkedin', 'letak', 'carousel')),
  hook text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  cta text NOT NULL DEFAULT '',
  hashtags text[] NOT NULL DEFAULT '{}',
  visual_brief text NOT NULL DEFAULT '',
  selected_for_client boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_proposals_project_id ON project_proposals (project_id);
CREATE INDEX IF NOT EXISTS idx_project_proposals_selected ON project_proposals (project_id, selected_for_client) WHERE selected_for_client = true;

COMMENT ON TABLE project_proposals IS 'Návrhy příspěvků dle strategie (formát, text, popis vizuálu). Vybrané (selected_for_client) se zobrazí klientovi.';
