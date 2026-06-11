create table if not exists client_drive_config (
  id uuid primary key default gen_random_uuid(),
  client_project_id uuid references client_projects(id)
    on delete cascade,
  drive_folder_id text not null,
  folder_structure jsonb,
  text_contents jsonb,
  last_synced_at timestamp with time zone,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_drive_config_client
  on client_drive_config(client_project_id);
