create extension if not exists pgcrypto;

create table if not exists coworkers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  entry_date date,
  social_security_number text,
  hours_per_week numeric(5, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists coworker_workdays (
  coworker_id uuid not null references coworkers(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  primary key (coworker_id, weekday)
);

create table if not exists coworker_absences (
  id uuid primary key default gen_random_uuid(),
  coworker_id uuid not null references coworkers(id) on delete cascade,
  type text not null check (type in ('sick', 'vacation')),
  from_date date not null,
  to_date date not null,
  created_at timestamptz not null default now(),
  check (from_date <= to_date)
);

create index if not exists coworker_absences_coworker_id_idx
  on coworker_absences(coworker_id);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists coworkers_set_updated_at on coworkers;
create trigger coworkers_set_updated_at
before update on coworkers
for each row
execute function set_updated_at();
