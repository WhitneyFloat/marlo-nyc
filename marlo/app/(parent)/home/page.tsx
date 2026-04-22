import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MatchBanner } from '@/components/ui/match-banner'
import { WaitlistAlert } from '@/components/ui/waitlist-alert'
import { ProgramCard } from '@/components/ui/program-card'
import type { Program, Match } from '@/types'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Load children
  const { data: children } = await supabase
    .from('children')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  // If no children yet, redirect to onboarding
  if (!children?.length) redirect('/onboarding')

  const activeChild = children[0]

  // Load recent matches for active child
  const { data: matches } = await supabase
    .from('matches')
    .select('*, program:programs(*, provider:providers(*))')
    .eq('child_id', activeChild.id)
    .eq('status', 'active')
    .order('match_score', { ascending: false })
    .limit(3)

  // Load waitlist alerts (notified but unclaimed)
  const { data: waitlistAlerts } = await supabase
    .from('waitlist')
    .select('*, program:programs(id, name)')
    .eq('child_id', activeChild.id)
    .not('notified_at', 'is', null)
    .is('claimed_at', null)

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1
          className="text-2xl text-ink"
          style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
        >
          Good morning.
        </h1>
        <p className="text-stone font-body text-sm mt-1">
          Here&apos;s what Marlo found for {activeChild.name}.
        </p>
      </div>

      {/* Waitlist alerts */}
      {waitlistAlerts?.map(alert => (
        <WaitlistAlert
          key={alert.id}
          programName={alert.program?.name ?? 'Program'}
          programId={alert.program_id}
          childName={activeChild.name}
        />
      ))}

      {/* AI Match banner */}
      {matches && matches.length > 0 ? (
        <MatchBanner
          childName={activeChild.name}
          matchCount={matches.length}
        />
      ) : (
        <div
          className="rounded-2xl p-6 text-center"
          style={{ background: 'linear-gradient(135deg, #C4603A 0%, #E8896A 100%)' }}
        >
          <p
            className="text-warm-white text-xl mb-3"
            style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
          >
            Marlo&apos;s getting your matches ready.
          </p>
          <a
            href="/search"
            className="inline-block bg-warm-white text-terracotta text-sm font-body font-semibold px-5 py-2.5 rounded-full hover:bg-cream transition-colors"
          >
            Find programs now →
          </a>
        </div>
      )}

      {/* Recent matches */}
      {matches && matches.length > 0 && (
        <div>
          <h2
            className="text-lg text-ink mb-3"
            style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
          >
            Marlo&apos;s picks for {activeChild.name}
          </h2>
          <div className="space-y-3">
            {matches.map((match, i) => (
              match.program && (
                <ProgramCard
                  key={match.id}
                  program={match.program as Program}
                  match={match as Match}
                  rank={i + 1}
                  childName={activeChild.name}
                />
              )
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
