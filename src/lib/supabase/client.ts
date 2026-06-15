'use client'

import { createBrowserClient } from '@supabase/ssr'

// Using untyped client — pages import types from @/types directly.
// Re-generate with: npx supabase gen types typescript --project-id YOUR_ID
export function createClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createBrowserClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
