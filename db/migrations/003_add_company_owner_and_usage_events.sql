alter table companies
  add column if not exists owner_name text;

alter table companies
  add column if not exists account_creation_date date not null default current_date;

create table if not exists usage_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  event_type text not null check (event_type in ('coworker_created', 'timesheet_generated')),
  coworker_id uuid references coworkers(id) on delete set null,
  coworker_name text,
  date_range_from date,
  date_range_to date,
  format text,
  created_at timestamptz not null default now()
);

create index if not exists usage_events_company_id_idx
  on usage_events(company_id, created_at desc);
