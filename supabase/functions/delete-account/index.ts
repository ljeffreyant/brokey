// Supabase Edge Function: lets a signed-in person delete their own account (App Store guideline 5.1.1(v)).
// Deploy:  supabase functions deploy delete-account
// verify_jwt stays on (the default), so only callers with a valid session reach this code.
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  const auth = req.headers.get('Authorization');
  if (!auth) return new Response(JSON.stringify({ error: 'Missing authorization' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } });

  const url = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  // Find out who is calling from their own token, never from the request body.
  const token = auth.replace(/^Bearer\s+/i, '');
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return new Response(JSON.stringify({ error: 'Not signed in' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } });

  // Rows in public.snapshots reference auth.users with ON DELETE CASCADE, so they go with the user.
  const { error: delError } = await admin.auth.admin.deleteUser(data.user.id);
  if (delError) return new Response(JSON.stringify({ error: delError.message }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });

  return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, 'Content-Type': 'application/json' } });
});
