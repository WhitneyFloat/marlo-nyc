import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { searchParams } = new URL(request.url)
  const category    = searchParams.get('category')
  const borough     = searchParams.get('borough') ?? 'brooklyn'

  let query = supabase
    .from('providers')
    .select('*, programs(*)')
    .eq('plan_status', 'active')

  if (category) query = query.eq('category', category)
  if (borough)  query = query.eq('borough', borough)

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ providers: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, category, neighborhood, borough, contact_email, contact_phone, website, instagram } = body

  if (!name || !category) {
    return NextResponse.json({ error: 'name and category are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('providers')
    .insert({
      name,
      category,
      neighborhood,
      borough:       borough ?? 'brooklyn',
      contact_email: contact_email ?? user.email,
      contact_phone,
      website,
      instagram,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ provider: data }, { status: 201 })
}
