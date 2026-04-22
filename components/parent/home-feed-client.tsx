'use client'

import { useState, useCallback } from 'react'
import type { Child, Match, Program } from '@/types'
import { ChildSwitcher } from '@/components/ui/child-switcher'
import { MatchBanner } from '@/components/ui/match-banner'
import { ProgramCard } from '@/components/ui/program-card'
import { QuickFilters, type CategoryFilter } from '@/components/ui/quick-filters'
import { RealtimeWaitlist } from '@/components/parent/realtime-waitlist'
import { ProgramCardSkeleton, MatchBannerSkeleton } from '@/components/ui/skeleton'

interface WaitlistAlert {
  id: string
  program_id: string
  program_name: string
  child_name: string
}

interface MatchWithProgram extends Match {
  program: Program
}

interface HomeFeedClientProps {
  profiles:          Child[]
  initialMatches:    MatchWithProgram[]
  initialChildId:    string
  waitlistAlerts:    Record<string, WaitlistAlert[]> // childId → alerts
  savedProgramIds:   string[]
}

function greet(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function HomeFeedClient({
  profiles,
  initialMatches,
  initialChildId,
  waitlistAlerts,
  savedProgramIds,
}: HomeFeedClientProps) {
  const [activeChildId, setActiveChildId] = useState(initialChildId)
  const [matches, setMatches]             = useState<MatchWithProgram[]>(initialMatches)
  const [filter, setFilter]               = useState<CategoryFilter>('all')
  const [fetching, setFetching]           = useState(false)

  const activeChild = profiles.find(c => c.id === activeChildId) ?? profiles[0]
  const alerts      = waitlistAlerts[activeChildId] ?? []

  const handleChildChange = useCallback(async (childId: string) => {
    setActiveChildId(childId)
    setFilter('all')
    setFetching(true)

    try {
      const res = await fetch(`/api/match/cached?childId=${childId}`)
      if (res.ok) {
        const data = await res.json()
        setMatches(data.matches ?? [])
      } else {
        setMatches([])
      }
    } catch {
      setMatches([])
    } finally {
      setFetching(false)
    }
  }, [])

  const filteredMatches = filter === 'all'
    ? matches
    : matches.filter(m => m.program?.category === filter)

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-5 animate-fade-in">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-2xl text-ink"
            style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
          >
            {greet()}.
          </h1>
          <p className="text-stone font-body text-sm mt-1">
            Marlo found {matches.length > 0 ? `${matches.length} match${matches.length !== 1 ? 'es' : ''}` : 'programs'} for {activeChild?.name}.
          </p>
        </div>
        {profiles.length > 1 && (
          <ChildSwitcher
            profiles={profiles}
            activeChildId={activeChildId}
            onChange={handleChildChange}
          />
        )}
      </div>

      {/* Realtime waitlist alerts */}
      {activeChild && (
        <RealtimeWaitlist
          childId={activeChildId}
          childName={activeChild.name}
          initialAlerts={alerts}
        />
      )}

      {/* Match banner or proactive prompt */}
      {fetching ? (
        <MatchBannerSkeleton />
      ) : matches.length > 0 ? (
        <MatchBanner
          childName={activeChild?.name ?? ''}
          matchCount={matches.length}
        />
      ) : (
        <ProactivePrompt childName={activeChild?.name ?? ''} childId={activeChildId} onMatches={setMatches} />
      )}

      {/* Quick category filters */}
      {matches.length > 0 && (
        <QuickFilters active={filter} onChange={setFilter} />
      )}

      {/* Match cards */}
      {fetching ? (
        <div className="space-y-3">
          <ProgramCardSkeleton />
          <ProgramCardSkeleton />
          <ProgramCardSkeleton />
        </div>
      ) : filteredMatches.length > 0 ? (
        <div>
          <h2
            className="text-base text-ink mb-3"
            style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
          >
            {filter === 'all' ? `Marlo’s picks for ${activeChild?.name}` : `${filter.replace('_', ' ')} for ${activeChild?.name}`}
          </h2>
          <div className="space-y-3">
            {filteredMatches.map((match, i) => (
              <ProgramCard
                key={match.id}
                program={match.program}
                match={match}
                rank={i + 1}
                childName={activeChild?.name}
                saved={savedProgramIds.includes(match.program_id)}
                childId={activeChildId}
              />
            ))}
          </div>
        </div>
      ) : filter !== 'all' ? (
        <div className="text-center py-8">
          <p className="text-stone font-body text-sm">
            No {filter.replace('_', ' ')} matches right now.
          </p>
          <button
            onClick={() => setFilter('all')}
            className="text-terracotta text-sm font-body mt-2 hover:text-terra-light transition-colors"
          >
            See all matches →
          </button>
        </div>
      ) : null}
    </div>
  )
}

// Shown when no matches exist yet — triggers proactive matching
function ProactivePrompt({
  childName,
  childId,
  onMatches,
}: {
  childName: string
  childId:   string
  onMatches: (matches: MatchWithProgram[]) => void
}) {
  const [loading, setLoading] = useState(false)

  async function runProactiveMatch() {
    setLoading(true)
    try {
      const res = await fetch('/api/match/proactive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId }),
      })
      if (res.ok) {
        const data = await res.json()
        onMatches(data.matches ?? [])
      }
    } catch {
      // silently fail — user can search manually
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: 'linear-gradient(135deg, #C4603A 0%, #E8896A 100%)' }}
    >
      {loading ? (
        <div className="flex items-center gap-3">
          <span className="w-5 h-5 border-2 border-warm-white/40 border-t-warm-white rounded-full animate-spin flex-shrink-0" />
          <p
            className="text-warm-white text-lg"
            style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
          >
            Marlo&apos;s handling it...
          </p>
        </div>
      ) : (
        <>
          <p
            className="text-warm-white text-xl mb-1"
            style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
          >
            Marlo&apos;s got {childName} covered.
          </p>
          <p className="text-warm-white/80 font-body text-sm mb-4">
            Ready to find the best programs this week.
          </p>
          <button
            onClick={runProactiveMatch}
            className="inline-flex items-center gap-2 bg-warm-white text-terracotta text-sm font-body font-semibold px-5 py-2.5 rounded-full hover:bg-cream transition-colors"
          >
            Find {childName}&apos;s matches →
          </button>
        </>
      )}
    </div>
  )
}
