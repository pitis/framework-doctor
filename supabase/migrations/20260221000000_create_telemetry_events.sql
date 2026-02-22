create table telemetry_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  framework text not null,
  score int not null,
  score_bucket text not null,
  diagnostic_count int not null,
  has_typescript boolean not null,
  is_diff_mode boolean not null,
  cli_version text not null
);
