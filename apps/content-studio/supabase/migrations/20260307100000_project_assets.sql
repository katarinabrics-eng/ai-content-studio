-- Podklady k projektům (client_projects): fotky, loga, PDF, inspirace.
-- V Supabase Dashboard (Storage) vytvořte bucket "project-assets" (public nebo RLS dle potřeby).
-- Cesta ve storage: [project_id]/[timestamp]_[filename]

create table if not exists project_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references client_projects (id) on delete cascade,
  filename text not null,
  storage_path text not null,
  file_type text not null,
  file_size integer not null default 0,
  category text not null default 'photos'
    check (category in ('photos', 'logos', 'inspiration')),
  created_at timestamptz not null default now()
);

create index if not exists idx_project_assets_project_id on project_assets (project_id);

comment on table project_assets is 'Podklady kurátora k diagnostice: fotky, loga, PDF, moodboard. Storage bucket: project-assets.';
