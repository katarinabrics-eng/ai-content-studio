-- Dvouúrovňová hierarchie: klient (osoba) → projekt (brand).
-- client_name — jméno osoby (např. "Lenka Roubalová")
-- project_name — název brandu (např. "ContentPro")

alter table client_projects
  add column if not exists client_name text,
  add column if not exists project_name text;

comment on column client_projects.client_name is 'Jméno klienta (osoby). Zobrazení: hlavní nadpis v sidebaru.';
comment on column client_projects.project_name is 'Název projektu/brandu. Zobrazení: pod klientem v sidebaru a nadpis detailu.';
