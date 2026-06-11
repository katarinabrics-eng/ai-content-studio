-- Verze diagnostiky: při opětovném spuštění se stejným emailem a webem
-- se data neprepisují, ale uloží jako nová verze. Kurátor může přijmout / ignorovat / porovnat.

create table if not exists diagnostic_versions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references client_projects (id) on delete cascade,
  scan_result jsonb not null default '{}',
  created_at timestamptz not null default now(),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'ignored'))
);

create index if not exists idx_diagnostic_versions_project_id
  on diagnostic_versions (project_id);
create index if not exists idx_diagnostic_versions_status
  on diagnostic_versions (project_id, status) where status = 'pending';

comment on table diagnostic_versions is 'Historie verzí scan_result; při duplicitní diagnostice (email+web) se ukládá zde místo přepisu projektu.';
