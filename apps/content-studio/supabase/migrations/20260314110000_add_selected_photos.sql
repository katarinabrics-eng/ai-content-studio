create table if not exists client_selected_photos (
  id uuid primary key default gen_random_uuid(),
  client_project_id uuid references client_projects(id)
    on delete cascade,
  selected_file_ids jsonb default '[]',
  updated_at timestamp with time zone default now()
);
create index if not exists idx_selected_photos_client
  on client_selected_photos(client_project_id);
