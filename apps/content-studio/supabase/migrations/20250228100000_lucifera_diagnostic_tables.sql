-- Lucifera Diagnostic: rozšíření clients o status a tabulka diagnostic_projects.
-- Existující tabulka projects zůstává beze změny (jiný workflow).

-- clients: přidat status pro životní cyklus (lead / diagnostic / premium / inactive)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.clients
      ADD COLUMN status text DEFAULT 'lead'
      CHECK (status IN ('lead', 'diagnostic', 'premium', 'inactive'));
  END IF;
END $$;

-- diagnostic_projects: projekty z wizardu (diagnostika / prémiová identita)
CREATE TABLE IF NOT EXISTS public.diagnostic_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients (id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('diagnostic', 'premium')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'closed')),
  intake_data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_diagnostic_projects_client_id ON public.diagnostic_projects (client_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_projects_status ON public.diagnostic_projects (status);
CREATE INDEX IF NOT EXISTS idx_diagnostic_projects_type ON public.diagnostic_projects (type);

ALTER TABLE public.diagnostic_projects ENABLE ROW LEVEL SECURITY;
