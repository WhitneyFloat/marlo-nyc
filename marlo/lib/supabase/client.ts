import { createBrowserClient } from '@supabase/ssr'

function getSupabaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/^<|>$/g, '').trim()
  if (!raw) return 'https://placeholder.supabase.co'
  try {
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
