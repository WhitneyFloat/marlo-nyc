import { createServiceClient } from '@/lib/supabase/server'

const CLAIM_WINDOW_HOURS = 2

export async function checkWaitlistAndNotify(programId: string): Promise<void> {
  const supabase = await createServiceClient()

  // Check spots on program
  const { data: program } = await supabase
    .from('programs')
    .select('id, name, spots_remaining')
    .eq('id', programId)
    .single()

  if (!program || !program.spots_remaining || program.spots_remaining <= 0) return

  // Get next unclaimed, un-expired waitlist entry
  const { data: entry } = await supabase
    .from('waitlist')
    .select('*, children(name, user_id, users(email))')
    .eq('program_id', programId)
    .is('claimed_at', null)
    .is('notified_at', null)
    .order('position', { ascending: true })
    .limit(1)
    .single()

  if (!entry) return

  const expiredAt = new Date(Date.now() + CLAIM_WINDOW_HOURS * 60 * 60 * 1000).toISOString()

  // Mark as notified and set expiry window
  await supabase
    .from('waitlist')
    .update({ notified_at: new Date().toISOString(), expired_at: expiredAt })
    .eq('id', entry.id)

  // Email notification via /api/waitlist/notify (Resend)
  // The API route handles delivery to keep this agent lightweight
}

export async function expireClaimWindows(): Promise<void> {
  const supabase = await createServiceClient()
  const now = new Date().toISOString()

  // Expire notifications that weren't claimed in time
  const { data: expired } = await supabase
    .from('waitlist')
    .select('id, program_id')
    .not('notified_at', 'is', null)
    .is('claimed_at', null)
    .lt('expired_at', now)

  if (!expired?.length) return

  // Reset notification so next family can be notified
  const ids = expired.map(e => e.id)
  await supabase
    .from('waitlist')
    .update({ notified_at: null, expired_at: null })
    .in('id', ids)

  // Trigger re-check for each affected program
  const programIds = Array.from(new Set(expired.map(e => e.program_id)))
  await Promise.all(programIds.map(id => checkWaitlistAndNotify(id)))
}
