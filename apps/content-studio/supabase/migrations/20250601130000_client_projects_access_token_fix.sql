-- Oprava pro DB, kde byly sloupce přidány ručně jako timestamp (bez time zone) nebo bez UNIQUE.
-- Spusťte jen pokud jste již dříve přidali access_token / access_expires_at jiným skriptem.

-- access_expires_at: změna na timestamptz (kvůli konzistentnímu vypršení 7denního přístupu)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'client_projects' and column_name = 'access_expires_at'
  ) then
    alter table client_projects
      alter column access_expires_at type timestamptz using access_expires_at::timestamptz;
  end if;
end $$;

-- access_token: přidání UNIQUE, pokud ještě neexistuje
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.client_projects'::regclass
      and conname = 'client_projects_access_token_key'
  ) then
    alter table client_projects add constraint client_projects_access_token_key unique (access_token);
  end if;
end $$;
