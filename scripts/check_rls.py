"""
Check Row Level Security
========================
Connects with the ANON key (not the service key) to confirm that
RLS policies are working:

    - page_views          → should return rows (public SELECT policy)
    - sentence_embeddings → should return 0 rows (requires authentication)

Usage:
    python scripts/check_rls.py

Prerequisites:
    - config.public.json with Supabase URL and anon key
"""

import json

from supabase import create_client


def main():
    with open('config.public.json', 'r') as f:
        public = json.load(f)

    # Connect with the ANON key (not service key!)
    client = create_client(public['SUPABASE_URL'], public['SUPABASE_ANON_KEY'])

    # This works — page_views has a public SELECT policy
    result = client.table('page_views').select('*').limit(5).execute()
    print(f"page_views: {len(result.data)} rows ✅")

    # This returns nothing — sentence_embeddings requires authentication
    result = client.table('sentence_embeddings').select('*').limit(5).execute()
    print(f"sentence_embeddings: {len(result.data)} rows (expected: 0) 🔒")


if __name__ == '__main__':
    main()
