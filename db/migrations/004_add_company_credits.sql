alter table companies
  add column if not exists credit_balance integer not null default 0;

alter table usage_events
  add column if not exists credits_used integer not null default 0;
