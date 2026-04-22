import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

// Returns cached active matches for a child (used when switching children on home feed)
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const childId = request.nextUrl.searchParams.get('childId')
  if (!childId) return NextResponse.json({ error: 'childId required' }, { status: 400 })

  // Verify ownership
  const { data: child } = await supabase
    .from('children')
    .select('id')
    .eq('id', childId)
    .eq('user_id', user.id)
    .single()

  if (!child) return NextResponse.json({ error: 'Child not found' }, { status: 404 })

  const { data: matches } = await supabase
    .from('matches')
    .select('*, program:programs(*, provider:providers(*))')
    .eq('child_id', childId)
    .eq('status', 'active')
    .order('match_score', { ascending: false })
    .limit(3)

  return NextResponse.json({ matches: matches ?? [] })
}
