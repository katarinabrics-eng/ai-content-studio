-- Jediný zdroj pravdy pro termíny rezervací (portrét, rodinné focení).
-- Kontrola překryvu: date + time + status in ('pending','paid').

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  service_type text not null,
  date date not null,
  time text not null,
  email text not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'cancelled')),
  expires_at timestamptz,
  stripe_session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_bookings_date_time_status
  on bookings (date, time) where status in ('pending', 'paid');

comment on table bookings is 'Rezervace termínů – jeden kalendář, kontrola překryvu.';
