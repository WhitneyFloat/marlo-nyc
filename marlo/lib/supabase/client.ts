import { createBrowserClient } from '@supabase/ssr'

function getSupabaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  if (!raw) return 'https://placeholder.supabase.co'
  try {
    // Strip any path like /rest/v1/ — Supabase only wants the origin
    return new URL(raw).origin
  } catch {
    return 'https://placeholder.supabase.co'
  }
}

export function createClient() {
  return createBrowserClient(
    getSupabaseUrl(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
  )
}
