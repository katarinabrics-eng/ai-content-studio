-- Krátký odkaz pro klienty: /d/[short_code] místo dlouhého ?token=...
alter table client_projects
  add column if not exists short_code text;

create unique index if not exists idx_client_projects_short_code
  on client_projects (short_code) where short_code is not null;

comment on column client_projects.short_code is 'Krátký kód pro odkaz /d/[short_code] – generuje se při vytvoření záznamu.';
