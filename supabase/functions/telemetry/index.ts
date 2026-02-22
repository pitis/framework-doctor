import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-telemetry-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const encoder = new TextEncoder();

// ---- HMAC hashing (cached key) ----
let hmacKey: CryptoKey | null = null;

async function getHmacKey(secret: string): Promise<CryptoKey> {
  if (hmacKey) return hmacKey;
  hmacKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return hmacKey;
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await getHmacKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return [...new Uint8Array(signature)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const EnvSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  TELEMETRY_KEY: z.string().min(10).optional(),
  HASH_SECRET: z.string().min(16).optional(),
  HASH_ROTATE: z.enum(['none', 'month']).optional().default('month'),
});

const envParse = EnvSchema.safeParse({
  SUPABASE_URL: Deno.env.get('SUPABASE_URL'),
  SUPABASE_SERVICE_ROLE_KEY: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
  TELEMETRY_KEY: Deno.env.get('TELEMETRY_KEY'),
  HASH_SECRET: Deno.env.get('HASH_SECRET'),
  HASH_ROTATE: Deno.env.get('HASH_ROTATE') ?? 'month',
});

if (!envParse.success) {
  console.error('Invalid env:', envParse.error.flatten());
  throw new Error('Missing/invalid environment variables');
}

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TELEMETRY_KEY, HASH_SECRET, HASH_ROTATE } =
  envParse.data;

// ---- Supabase client (module scope) ----
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ---- Body validation ----
const telemetryEventSchema = z.object({
  doctor_family: z.string().min(1).max(50).optional(),
  framework: z.string().min(1).max(50),
  score: z.number(),
  score_bucket: z.string().min(1).max(50),
  diagnostic_count: z.number().int().min(0).max(100000),
  has_typescript: z.boolean(),
  is_diff_mode: z.boolean(),
  cli_version: z.string().min(1).max(50),

  // Optional client-side install id; we only store anon_install_id derived from it.
  install_id: z.string().min(10).max(200).optional(),

  // Optional: client-side dedupe id (uuid). If you add a unique constraint in DB, retries won't double-insert.
  event_id: z.string().uuid().optional(),
});

const REACT_FRAMEWORK_VALUES = new Set(['nextjs', 'vite', 'cra', 'remix', 'gatsby', 'unknown']);
const SVELTE_FRAMEWORK_VALUES = new Set(['svelte', 'sveltekit']);

const inferDoctorFamily = (framework: string): string => {
  if (SVELTE_FRAMEWORK_VALUES.has(framework)) return 'svelte';
  if (REACT_FRAMEWORK_VALUES.has(framework)) return 'react';
  return 'unknown';
};

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Shared-secret guard (recommended)
  if (TELEMETRY_KEY) {
    const key = req.headers.get('x-telemetry-key');
    if (key !== TELEMETRY_KEY) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const parsed = telemetryEventSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({
        error: 'Invalid event shape',
        details: parsed.error.flatten(), // remove in prod if you want
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }

  const {
    install_id,
    doctor_family,
    framework,
    score,
    score_bucket,
    diagnostic_count,
    has_typescript,
    is_diff_mode,
    cli_version,
    event_id,
  } = parsed.data;

  // Derive anonymous install id (optional)
  let anon_install_id: string | null = null;

  // Strict-ish behavior: if install_id is provided but HASH_SECRET is not set, ignore install_id (no crash).
  // If you want strict rejection instead, return 500 here.
  if (install_id && HASH_SECRET) {
    const rotationPrefix =
      HASH_ROTATE === 'month' ? `${new Date().toISOString().slice(0, 7)}:` : '';
    anon_install_id = await hmacSha256Hex(HASH_SECRET, `${rotationPrefix}${install_id}`);
  }

  const row = {
    doctor_family: doctor_family ?? inferDoctorFamily(framework),
    framework,
    score,
    score_bucket,
    diagnostic_count,
    has_typescript,
    is_diff_mode,
    cli_version,
    event_id: event_id ?? null,
    anon_install_id,
  };

  const { error } = await supabase.from('telemetry_events').insert(row, { returning: 'minimal' });

  if (error) {
    // If you add a unique constraint on event_id, duplicate retries can show up here.
    // You can optionally treat that as success by checking error.code, but it varies by client.
    console.error('Insert failed:', error);
    return new Response(JSON.stringify({ error: 'Insert failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(null, { status: 204, headers: corsHeaders });
});
