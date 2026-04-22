import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SearchView } from '@/components/parent/search-bar'
import type { Child } from '@/types'

export default async function SearchPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: childRows } = await supabase
    .from('children')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (!childRows?.length) redirect('/onboarding')

  return <SearchView profiles={childRows as Child[]} />
}
