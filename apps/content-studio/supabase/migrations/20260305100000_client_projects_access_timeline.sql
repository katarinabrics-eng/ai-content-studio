-- Časová osa a typ přístupu: FREE (3 dny), PAID (14 dní), ACTIVE (bez expirace).
-- last_contact_at: datum posledního hovoru/kontaktu (kurátor nebo automaticky při HOVOR).

alter table client_projects
  add column if not exists last_contact_at timestamptz,
  add column if not exists access_type text default 'FREE'
    check (access_type in ('FREE', 'PAID', 'ACTIVE'));

comment on column client_projects.last_contact_at is 'Datum posledního hovoru nebo kontaktu.';
comment on column client_projects.access_type is 'FREE = 3 dny, PAID = 14 dní, ACTIVE = bez expirace.';

-- Existující záznamy: ponechat access_expires_at jak je, access_type = FREE
update client_projects set access_type = 'FREE' where access_type is null;
