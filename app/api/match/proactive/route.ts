import { createClient } from '@/lib/supabase/server'
import { runMatchingAgent } from '@/lib/agents/matching-agent'
import { NextResponse, type NextRequest } from 'next/server'
import type { ChildProfile, Program } from '@/types'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { childId } = await request.json()
  if (!childId) return NextResponse.json({ error: 'childId required' }, { status: 400 })

  const { data: child } = await supabase
    .from('children')
    .select('*')
    .eq('id', childId)
    .eq('user_id', user.id)
    .single()

  if (!child) return NextResponse.json({ error: 'Child not found' }, { status: 404 })

  // Build a synthetic query from the child's profile
  const interestStr = child.interests?.join(', ') || 'any activity'
  const scheduleStr = child.schedule?.join(', ') || 'any day'
  const budgetStr   = child.budget_max ? `under $${child.budget_max}/month` : ''
  const needsStr    = child.needs?.length
    ? `Needs: ${child.needs.join(', ')}.`
    : ''
  const allergyStr  = child.allergies?.length
    ? `Allergy-safe required (${child.allergies.join(', ')}).`
    : ''

  const syntheticQuery = [
    `Find the best programs for ${child.name} (age ${child.age}) in ${child.neighborhood || 'Brooklyn'}.`,
    `Interests: ${interestStr}.`,
    scheduleStr !== 'any day' ? `Available: ${scheduleStr}.` : '',
    budgetStr,
    needsStr,
    allergyStr,
  ].filter(Boolean).join(' ')

  // Load active programs
  const { data: programs } = await supabase
    .from('programs')
    .select('*, provider:providers(*)')
    .eq('active', true)
    .limit(50)

  if (!programs?.length) return NextResponse.json({ matches: [] })

  const childProfile: ChildProfile = {
    name:        child.name,
    age:         child.age,
    interests:   child.interests   ?? [],
    schedule:    child.schedule    ?? [],
    allergies:   child.allergies   ?? [],
    needs:       child.needs       ?? [],
    budgetMax:   child.budget_max  ?? 999,
    neighborhood: child.neighborhood ?? 'Brooklyn',
  }

  const matchResults = await runMatchingAgent(childProfile, syntheticQuery, programs as Program[])

  // Clear old proactive matches, insert new ones
  await supabase
    .from('matches')
    .delete()
    .eq('child_id', childId)
    .eq('status', 'active')
    .is('query_text', null)

  const rows = matchResults.map(m => ({
    child_id:      childId,
    program_id:    m.programId,
    match_score:   m.matchScore,
    match_reasons: m.matchReasons,
    explanation:   m.explanation,
    query_text:    null,
    status:        'active',
  }))

  const { data: saved } = await supabase
    .from('matches')
    .insert(rows)
    .select('*, program:programs(*, provider:providers(*))')

  return NextResponse.json({ matches: saved ?? [] })
}
