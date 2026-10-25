// CORS headers shared by every Edge Function.
// The site is served from GitHub Pages (a different origin than Supabase),
// so the browser sends a preflight OPTIONS request before each call.
// Auth uses a bearer token (not cookies), so allowing any origin is safe here.
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
