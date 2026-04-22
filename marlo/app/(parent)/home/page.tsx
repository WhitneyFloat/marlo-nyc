import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { HomeFeedClient } from '@/components/parent/home-feed-client'
import type { Child, Match, Program } from '@/types'

interface MatchWithProgram extends Match {
  program: Program
}

interface WaitlistAlert {
  id: string
  program_id: string
  program_name: string
  child_name: string
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Load all children for this user
  const { data: childRows } = await supabase
    .from('children')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (!childRows?.length) redirect('/onboarding')

  const children = childRows as Child[]
  const primaryChild = children[0]

  // Load cached matches for primary child (most recent active)
  const { data: matchRows } = await supabase
    .from('matches')
    .select('*, program:programs(*, provider:providers(*))')
    .eq('child_id', primaryChild.id)
    .eq('status', 'active')
    .order('match_score', { ascending: false })
    .limit(3)

  const initialMatches = (matchRows ?? []) as MatchWithProgram[]

  // Load waitlist alerts for all children (notified but unclaimed)
  const { data: waitlistRows } = await supabase
    .from('waitlist')
    .select('id, program_id, child_id, program:programs(name)')
    .in('child_id', children.map(c => c.id))
    .not('notified_at', 'is', null)
    .is('claimed_at', null)

  // Group alerts by child_id
  const waitlistAlerts: Record<string, WaitlistAlert[]> = {}
  for (const entry of waitlistRows ?? []) {
    const childName = children.find(c => c.id === entry.child_id)?.name ?? ''
    if (!waitlistAlerts[entry.child_id]) waitlistAlerts[entry.child_id] = []
    waitlistAlerts[entry.child_id].push({
      id:           entry.id,
      program_id:   entry.program_id,
      program_name: (Array.isArray(entry.program) ? entry.program[0]?.name : (entry.program as { name?: string } | null)?.name) ?? '',
      child_name:   childName,
    })
  }

  // Load saved program IDs for primary child
  const { data: savedRows } = await supabase
    .from('saved_programs')
    .select('program_id')
    .eq('child_id', primaryChild.id)

  const savedProgramIds = (savedRows ?? []).map(r => r.program_id)

  return (
    <HomeFeedClient
      profiles={children}
      initialMatches={initialMatches}
      initialChildId={primaryChild.id}
      waitlistAlerts={waitlistAlerts}
      savedProgramIds={savedProgramIds}
    />
  )
}
