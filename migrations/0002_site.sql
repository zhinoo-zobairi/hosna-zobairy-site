-- Appointment requests, versioned site content, and form rate limits.
-- Decisions (retention, limits) live in docs/superpowers/specs/2026-11-01-scrollytelling-site-design.md.

create table appointment_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (length(name) between 1 and 120),
  phone text not null check (length(phone) between 5 and 40),
  procedure text not null,
  preferred_day text not null check (preferred_day in ('any', 'sat', 'sun', 'tue')),
  note text check (length(note) <= 1000),
  lang text not null check (lang in ('en', 'ku')),
  status text not null default 'new' check (status in ('new', 'contacted', 'done')),
  email_sent boolean not null default false
);
create index appointment_requests_created_at on appointment_requests (created_at desc);

create table content_versions (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  created_by text not null,
  content jsonb not null
);

create table rate_limits (
  key text not null,
  created_at timestamptz not null default now()
);
create index rate_limits_key_time on rate_limits (key, created_at);
