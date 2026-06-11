-- Balíčky strategií: snapshot Brand DNA + strategie, typ výstupu, stav generování.

create table if not exists strategy_bundles (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references client_projects (id) on delete cascade,
  name text not null,
  output_type text not null
    check (output_type in ('GAMMA', 'CANVA', 'NOTEBOOKLM', 'CUSTOM')),
  status text not null default 'NAVRH'
    check (status in ('NAVRH', 'PRIPRAVENY', 'GENERUJE', 'HOTOVO')),
  strategy_label text,
  created_at timestamptz not null default now(),
  output_url text,
  snapshot_dna jsonb,
  snapshot_strategy jsonb
);

create index if not exists idx_strategy_bundles_project_id on strategy_bundles (project_id);
create index if not exists idx_strategy_bundles_status on strategy_bundles (project_id, status);

comment on table strategy_bundles is 'Balíčky výstupů ze strategií (Gamma, Canva, NotebookLM, vlastní). Snapshot DNA a strategie při vytvoření.';
