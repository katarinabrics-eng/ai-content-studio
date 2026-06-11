-- Pgcrypto extension a projects tabulka dle specifikace.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_code text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'PROCESSING_DATA',
  plan_id text,
  client_email text,
  storage_prefix text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
