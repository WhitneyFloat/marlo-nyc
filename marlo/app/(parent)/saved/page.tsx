import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProgramCard } from '@/components/ui/program-card'
import { ChildSwitcherServer } from '@/components/parent/child-switcher-server'
import type { Child, Program, Match } from '@/types'

interface SavedWithProgram {
  id: string
  child_id: string
  program_id: string
  saved_at: string
  program: Program
}

export default async function SavedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: childRows } = await supabase
    .from('children')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (!childRows?.length) redirect('/onboarding')

  const children = childRows as Child[]
  const primaryChild = children[0]

  const { data: savedRows } = await supabase
    .from('saved_programs')
    .select('*, program:programs(*, provider:providers(*))')
    .eq('child_id', primaryChild.id)
    .order('saved_at', { ascending: false })

  const saved = (savedRows ?? []) as SavedWithProgram[]

  // Load matches for this child so we can show match scores on cards
  const { data: matchRows } = await supabase
    .from('matches')
    .select('*')
    .eq('child_id', primaryChild.id)
    .in('program_id', saved.map(s => s.program_id))

  const matchMap = new Map<string, Match>()
  for (const m of matchRows ?? []) matchMap.set(m.program_id, m as Match)

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1
          className="text-2xl text-ink"
          style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
        >
          Saved programs.
        </h1>
        {children.length > 1 && (
          <ChildSwitcherServer profiles={children} activeChildId={primaryChild.id} />
        )}
      </div>

      {saved.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-full bg-parchment flex items-center justify-center mx-auto mb-4">
            <svg className="w-5 h-5 text-stone" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <p
            className="text-xl text-ink mb-2"
            style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
          >
            Nothing saved yet.
          </p>
          <p className="text-stone font-body text-sm mb-6">
            Bookmark programs from your matches and they&apos;ll live here.
          </p>
          <a
            href="/search"
            className="inline-block bg-terracotta text-warm-white font-body font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-terra-light transition-colors"
          >
            Find programs →
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {saved.map(item => (
            <ProgramCard
              key={item.id}
              program={item.program}
              match={matchMap.get(item.program_id)}
              childName={primaryChild.name}
              saved
              childId={primaryChild.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
