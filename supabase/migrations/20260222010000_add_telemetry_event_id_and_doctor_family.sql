alter table telemetry_events
  add column if not exists doctor_family text,
  add column if not exists event_id uuid;

update telemetry_events
set doctor_family = case
  when framework in ('svelte', 'sveltekit') then 'svelte'
  when framework in ('nextjs', 'vite', 'cra', 'remix', 'gatsby', 'unknown') then 'react'
  else 'unknown'
end
where doctor_family is null;

alter table telemetry_events
  alter column doctor_family set default 'unknown';

alter table telemetry_events
  alter column doctor_family set not null;

create unique index if not exists telemetry_events_event_id_key
  on telemetry_events (event_id)
  where event_id is not null;
