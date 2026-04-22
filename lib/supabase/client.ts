import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Fallbacks prevent Supabase from throwing during Next.js build-time prerender.
  // Real values must be set in Vercel env vars for the app to function at runtime.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
  return createBrowserClient(url, key)
}
