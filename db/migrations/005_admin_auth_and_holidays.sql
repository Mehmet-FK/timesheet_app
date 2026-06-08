create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists admin_sessions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references admins(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table coworkers
  add column if not exists holiday_dates jsonb not null default '[]'::jsonb;

alter table coworker_absences
  drop constraint if exists coworker_absences_type_check;

create index if not exists admin_sessions_admin_id_idx
  on admin_sessions(admin_id);

drop trigger if exists admins_set_updated_at on admins;
create trigger admins_set_updated_at
before update on admins
for each row
execute function set_updated_at();
