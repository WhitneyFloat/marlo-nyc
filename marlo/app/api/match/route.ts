import { createClient } from '@/lib/supabase/server'
import { runMatchingAgent } from '@/lib/agents/matching-agent'
import { NextResponse, type NextRequest } from 'next/server'
import type { ChildProfile, Program } from '@/types'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { childId, query } = await request.json()
  if (!childId || !query?.trim()) {
    return NextResponse.json({ error: 'childId and query are required' }, { status: 400 })
  }

  // Verify child belongs to this user
  const { data: child } = await supabase
    .from('children')
    .select('*')
    .eq('id', childId)
    .eq('user_id', user.id)
    .single()

  if (!child) return NextResponse.json({ error: 'Child not found' }, { status: 404 })

  // Load active programs
  const { data: programs } = await supabase
    .from('programs')
    .select('*, provider:providers(*)')
    .eq('active', true)
    .limit(50)

  if (!programs?.length) {
    return NextResponse.json({ matches: [] })
  }

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

  const matchResults = await runMatchingAgent(childProfile, query, programs as Program[])

  // Persist matches to DB (upsert — replace stale query results)
  await supabase.from('matches').delete()
    .eq('child_id', childId)
    .eq('status', 'active')
    .not('query_text', 'is', null)

  const matchRows = matchResults.map(m => ({
    child_id:      childId,
    program_id:    m.programId,
    match_score:   m.matchScore,
    match_reasons: m.matchReasons,
    query_text:    query,
    status:        'active',
    explanation:   m.explanation,
  }))

  const { data: savedMatches } = await supabase
    .from('matches')
    .insert(matchRows)
    .select('*, program:programs(*, provider:providers(*))')

  return NextResponse.json({ matches: savedMatches ?? [] })
}
