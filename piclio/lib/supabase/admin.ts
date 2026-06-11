import { createClient } from '@supabase/supabase-js'

// Service role client — bypasses RLS, only for server-side use
// Custom fetch with cache: 'no-store' prevents Next.js App Router
// from caching Supabase SDK requests (permanent fix for stale data bug)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    global: {
      fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }),
    },
  }
)
