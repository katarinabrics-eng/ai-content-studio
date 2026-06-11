-- ClientProject: každý scan z diagnostiky + stav platby a termínu.
-- Jeden zdroj pravdy pro „klient / projekt z diagnostiky“.

create table if not exists client_projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  name text,
  email text,

  web_url text,
  manual_input text,

  scan_result jsonb not null default '{}',

  payment_status text not null default 'none'
    check (payment_status in ('none', 'pending', 'paid')),

  booking_id uuid references bookings (id) on delete set null,
  booking_date date,
  booking_time text,

  status text not null default 'new'
    check (status in ('new', 'paid', 'in_progress', 'done'))
);

create index if not exists idx_client_projects_created_at
  on client_projects (created_at desc);
create index if not exists idx_client_projects_payment_status
  on client_projects (payment_status);
create index if not exists idx_client_projects_booking_id
  on client_projects (booking_id) where booking_id is not null;

comment on table client_projects is 'Scan z diagnostiky + platba a termín. Redakční základ.';
