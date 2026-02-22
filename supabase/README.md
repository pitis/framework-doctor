# Supabase telemetry

Stores anonymous analytics from framework-doctor (react-doctor, svelte-doctor).

## Setup

1. Create a [Supabase project](https://supabase.com/dashboard)
2. Run migrations: `supabase db push` (or apply both files in `migrations/` via the SQL editor)
3. Deploy the Edge Function: `supabase functions deploy telemetry`
4. Set `FRAMEWORK_DOCTOR_TELEMETRY_URL` to your function URL (e.g. `https://<project-ref>.supabase.co/functions/v1/telemetry`) in your publish/CI env

## Optional environment variables

- `TELEMETRY_KEY` — Shared secret for `x-telemetry-key` header; if set, requests without it are rejected
- `HASH_SECRET` — HMAC secret for deriving `anon_install_id` from client `install_id`; if unset, install tracking is skipped
- `HASH_ROTATE` — `"month"` (default) or `"none"`; monthly rotation anonymizes install IDs over time

## Data

Events are stored in `telemetry_events` with: framework, score, score_bucket, diagnostic_count, has_typescript, is_diff_mode, cli_version, anon_install_id.
