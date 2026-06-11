-- Lead z analýzy webu: e-mail + výsledek (pro kontakt a přehled bez Stripe).
CREATE TABLE IF NOT EXISTS public.analysis_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  analyzed_url text NOT NULL DEFAULT '',
  result jsonb NOT NULL DEFAULT '{}',
  scraped_meta jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analysis_leads_created_at ON public.analysis_leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_leads_email ON public.analysis_leads (email);

COMMENT ON TABLE public.analysis_leads IS 'E-maily a výsledky analýzy od uživatelů, kteří nezákoupili přes Stripe (pro kontakt a zkoušení).';
