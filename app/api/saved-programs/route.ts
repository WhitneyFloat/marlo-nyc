import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

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

  const { data } = await supabase
    .from('saved_programs')
    .select('*, program:programs(*, provider:providers(*))')
    .eq('child_id', childId)
    .order('saved_at', { ascending: false })

  return NextResponse.json({ saved: data ?? [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { childId, programId } = await request.json()
  if (!childId || !programId) {
    return NextResponse.json({ error: 'childId and programId required' }, { status: 400 })
  }

  // Verify child ownership
  const { data: child } = await supabase
    .from('children')
    .select('id')
    .eq('id', childId)
    .eq('user_id', user.id)
    .single()

  if (!child) return NextResponse.json({ error: 'Child not found' }, { status: 404 })

  // Upsert — no error if already saved
  const { data, error } = await supabase
    .from('saved_programs')
    .upsert({ child_id: childId, program_id: programId }, { onConflict: 'child_id,program_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ saved: data }, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const childId   = request.nextUrl.searchParams.get('childId')
  const programId = request.nextUrl.searchParams.get('programId')

  if (!childId || !programId) {
    return NextResponse.json({ error: 'childId and programId required' }, { status: 400 })
  }

  // Verify ownership via children table
  const { data: ownedIds } = await supabase
    .from('children')
    .select('id')
    .eq('user_id', user.id)

  const childIds = ownedIds?.map(c => c.id) ?? []
  if (!childIds.includes(childId)) {
    return NextResponse.json({ error: 'Child not found' }, { status: 404 })
  }

  await supabase
    .from('saved_programs')
    .delete()
    .eq('child_id', childId)
    .eq('program_id', programId)

  return NextResponse.json({ success: true })
}
