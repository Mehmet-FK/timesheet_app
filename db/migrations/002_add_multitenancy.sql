create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into companies (name, email, password_hash)
select 'Default Company', 'default@example.com', ''
where not exists (select 1 from companies);

alter table coworkers
  add column if not exists company_id uuid;

update coworkers
set company_id = (select id from companies order by created_at asc limit 1)
where company_id is null;

alter table coworkers
  alter column company_id set not null;

alter table coworkers
  drop constraint if exists coworkers_company_id_fkey;

alter table coworkers
  add constraint coworkers_company_id_fkey
  foreign key (company_id) references companies(id) on delete cascade;

create index if not exists coworkers_company_id_idx
  on coworkers(company_id);

create table if not exists company_sessions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists company_sessions_company_id_idx
  on company_sessions(company_id);

drop trigger if exists companies_set_updated_at on companies;
create trigger companies_set_updated_at
before update on companies
for each row
execute function set_updated_at();
