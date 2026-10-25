// embed-question: turns a question into a 1,536-dimension embedding.
// POST { "question": "..." }  →  { "embedding": [...] }
// The OpenAI key stays here on the server (set with `supabase secrets set OPENAI_API_KEY=...`).
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { getAuthenticatedUser } from '../_shared/auth.ts';

Deno.serve(async (req) => {
  // Browser preflight for cross-origin requests from GitHub Pages
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const user = await getAuthenticatedUser(req);
  if (!user) {
    return jsonResponse({ error: 'Please sign in to use semantic search' }, 401);
  }

  let question: unknown;
  try {
    ({ question } = await req.json());
  } catch {
    return jsonResponse({ error: 'Request body must be JSON' }, 400);
  }
  if (typeof question !== 'string' || !question.trim()) {
    return jsonResponse({ error: 'Missing "question"' }, 400);
  }

  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    return jsonResponse({ error: 'OPENAI_API_KEY secret is not set' }, 500);
  }

  // Must be the same model used in scripts/04_embed_data.py,
  // or the question and the sentences won't live in the same vector space.
  const openaiRes = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: question.trim(),
    }),
  });

  if (!openaiRes.ok) {
    console.error('OpenAI error:', openaiRes.status, await openaiRes.text());
    return jsonResponse({ error: 'Failed to generate embedding' }, 502);
  }

  const { data } = await openaiRes.json();
  return jsonResponse({ embedding: data[0].embedding });
});
