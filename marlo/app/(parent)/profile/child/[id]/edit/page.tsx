import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { EditChildForm } from '@/components/parent/edit-child-form'
import type { Child } from '@/types'

export default async function EditChildPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: child } = await supabase
    .from('children')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!child) notFound()

  return <EditChildForm child={child as Child} />
}
