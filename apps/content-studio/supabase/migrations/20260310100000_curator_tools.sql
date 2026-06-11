-- Kurátorské nástroje: aktivace výstupů, odeslání přístupu, brief, aktivita.
-- Zároveň doplní access_type a last_contact_at, pokud ještě neexistují (starší migrace).

-- client_projects: access_type a last_contact_at (pokud chybí)
alter table client_projects
  add column if not exists last_contact_at timestamptz,
  add column if not exists access_type text default 'FREE'
    check (access_type in ('FREE', 'PAID', 'ACTIVE'));

comment on column client_projects.last_contact_at is 'Datum posledního hovoru nebo kontaktu.';
comment on column client_projects.access_type is 'FREE = 3 dny, PAID = 14 dní, ACTIVE = bez expirace.';
update client_projects set access_type = 'FREE' where access_type is null;

-- client_projects: výstupy a přístup
alter table client_projects
  add column if not exists outputs_activated boolean not null default false,
  add column if not exists outputs_activated_at timestamptz,
  add column if not exists access_sent_at timestamptz,
  add column if not exists brief_submitted_at timestamptz;

comment on column client_projects.outputs_activated is 'Kurátor aktivoval výstupy pro klienta.';
comment on column client_projects.outputs_activated_at is 'Kdy byly výstupy aktivovány.';
comment on column client_projects.access_sent_at is 'Naposledy odeslaný přístupový odkaz klientovi.';
comment on column client_projects.brief_submitted_at is 'Kdy klient odeslal brief (dotazník).';

-- Aktivita projektu (brief, schválení, připomínky) — základ pro notifikace
create table if not exists project_activity (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references client_projects (id) on delete cascade,
  type text not null check (type in ('brief_submitted', 'content_approved', 'content_feedback', 'new_message')),
  message text,
  seen_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_project_activity_project_id on project_activity (project_id);
create index if not exists idx_project_activity_seen_at on project_activity (project_id, seen_at) where seen_at is null;

comment on table project_activity is 'Aktivita projektu pro kurátora (brief, schválení, připomínky). seen_at = null = nepřečteno.';
