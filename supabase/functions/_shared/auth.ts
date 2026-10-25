// Verifies the caller is a signed-in user.
// Functions are deployed with --no-verify-jwt, so we check the JWT ourselves:
// pull it from the Authorization header and ask Supabase Auth who it belongs to.
import { createClient, type User } from 'npm:@supabase/supabase-js@2';

export async function getAuthenticatedUser(req: Request): Promise<User | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice('Bearer '.length);

  // SUPABASE_URL and SUPABASE_ANON_KEY are provided to every Edge Function automatically
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
  );

  // Signed-out visitors send the anon key as their token, which has no user,
  // so getUser() returns an error and they're rejected.
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}
