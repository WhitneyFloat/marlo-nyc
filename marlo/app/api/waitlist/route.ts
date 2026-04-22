import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { childId, programId } = await request.json()
  if (!childId || !programId) {
    return NextResponse.json({ error: 'childId and programId are required' }, { status: 400 })
  }

  // Verify child belongs to user
  const { data: child } = await supabase
    .from('children')
    .select('id')
    .eq('id', childId)
    .eq('user_id', user.id)
    .single()

  if (!child) return NextResponse.json({ error: 'Child not found' }, { status: 404 })

  // Check if already on waitlist
  const { data: existing } = await supabase
    .from('waitlist')
    .select('id')
    .eq('child_id', childId)
    .eq('program_id', programId)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ message: 'Already on waitlist', id: existing.id })
  }

  // Get current waitlist length to set position
  const { count } = await supabase
    .from('waitlist')
    .select('id', { count: 'exact', head: true })
    .eq('program_id', programId)

  const position = (count ?? 0) + 1

  const { data, error } = await supabase
    .from('waitlist')
    .insert({ child_id: childId, program_id: programId, position })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update analytics — best-effort, non-blocking
  try {
    await supabase.rpc('increment_analytics', { p_program_id: programId, field: 'waitlist_adds' })
  } catch {}

  return NextResponse.json({ waitlist: data }, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const childId   = searchParams.get('childId')
  const programId = searchParams.get('programId')

  if (!childId || !programId) {
    return NextResponse.json({ error: 'childId and programId are required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('waitlist')
    .delete()
    .eq('child_id', childId)
    .eq('program_id', programId)
    .in(
      'child_id',
      (await supabase.from('children').select('id').eq('user_id', user.id)).data?.map(c => c.id) ?? []
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
