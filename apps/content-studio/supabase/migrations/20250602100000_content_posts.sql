-- Content pipeline pro kurátora a klienta (VIBE v3).
-- Příspěvky: generating → curator_review → client_review → approved → published

create table if not exists content_posts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  status text not null default 'generating'
    check (status in ('generating', 'curator_review', 'client_review', 'approved', 'published')),
  hook text,
  body text,
  cta text,
  hashtags text[],
  visual_brief text,
  ai_image_prompt text,
  canva_design_id text,
  canva_preview_url text,
  canva_edit_url text,
  agent_style text,
  pillar text,
  platform text default 'instagram',
  scheduled_for date,
  curator_note text,
  client_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_content_posts_project_id on content_posts (project_id);
create index if not exists idx_content_posts_status on content_posts (status);
create index if not exists idx_content_posts_scheduled_for on content_posts (scheduled_for) where scheduled_for is not null;

comment on table content_posts is 'Příspěvky content pipeline: kurátor schvaluje → klient schvaluje → publikace.';

-- Log odeslaných notifikací (kurátor / klient) – bez závislosti na clients.id
create table if not exists content_notification_log (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects (id) on delete set null,
  post_id uuid references content_posts (id) on delete set null,
  type text not null,
  recipient text,
  sent_at timestamptz not null default now()
);

create index if not exists idx_content_notification_log_project_id on content_notification_log (project_id);
create index if not exists idx_content_notification_log_type on content_notification_log (type);
