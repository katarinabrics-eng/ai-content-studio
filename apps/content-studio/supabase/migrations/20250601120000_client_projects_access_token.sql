-- Návrat klienta: magický odkaz (token) + 7denní bezplatný přístup.
-- access_token: unikátní token v URL (/diagnostika/view?token=...).
-- access_expires_at: po tomto čase je přístup zrušen (data zůstávají v nerealizovaných projektech).

alter table client_projects
  add column if not exists access_token text unique,
  add column if not exists access_expires_at timestamptz;

create index if not exists idx_client_projects_access_token
  on client_projects (access_token) where access_token is not null;

comment on column client_projects.access_token is 'Token pro odkaz /diagnostika/view?token=... (návrat klienta).';
comment on column client_projects.access_expires_at is 'Konec 7denního bezplatného přístupu; po té zobrazit „Přístup vypršel“.';
