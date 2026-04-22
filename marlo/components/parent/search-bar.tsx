'use client'

import { useState } from 'react'
import type { Child, Match, Program } from '@/types'
import { ChildSwitcher } from '@/components/ui/child-switcher'
import { ProgramCard } from '@/components/ui/program-card'

interface SearchViewProps {
  profiles: Child[]
}

interface MatchWithProgram extends Match {
  program: Program
}

export function SearchView({ profiles }: SearchViewProps) {
  const [activeChildId, setActiveChildId] = useState(profiles[0]?.id ?? '')
  const [query, setQuery]     = useState('')
  const [loading, setLoading] = useState(false)
  const [matches, setMatches] = useState<MatchWithProgram[] | null>(null)
  const [error, setError]     = useState<string | null>(null)

  const activeChild = profiles.find(c => c.id === activeChildId) ?? profiles[0]

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim() || !activeChild) return

    setLoading(true)
    setError(null)
    setMatches(null)

    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId: activeChild.id, query }),
      })

      if (!res.ok) throw new Error('Marlo had trouble with that search. Try again.')

      const data = await res.json()
      setMatches(data.matches)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
      {/* Child switcher */}
      {profiles.length > 1 && (
        <ChildSwitcher
          profiles={profiles}
          activeChildId={activeChildId}
          onChange={setActiveChildId}
        />
      )}

      {/* Search input */}
      <div>
        <h1
          className="text-2xl text-ink mb-1"
          style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
        >
          What&apos;s {activeChild?.name} into?
        </h1>
        <p className="text-stone font-body text-sm mb-4">
          Tell Marlo in your own words &mdash; &quot;soccer on Saturdays&quot; or &quot;something creative after school.&quot;
        </p>

        <form onSubmit={handleSearch} className="space-y-3">
          <textarea
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder='e.g. "Soccer on weekends with early drop-off, nut-free environment, under $200/month"'
            rows={3}
            className="w-full bg-warm-white border border-stone-pale rounded-2xl px-4 py-3.5 text-ink font-body text-sm placeholder:text-stone-light focus:outline-none focus:border-terracotta transition-colors resize-none"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="w-full bg-terracotta text-warm-white font-body font-semibold rounded-xl px-4 py-3.5 text-sm hover:bg-terra-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-warm-white/40 border-t-warm-white rounded-full animate-spin" />
                Marlo&apos;s handling it...
              </>
            ) : (
              'Find matches'
            )}
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-terra-glow/20 border border-terra-light/30 px-4 py-3">
          <p className="text-terracotta text-sm font-body">{error}</p>
        </div>
      )}

      {/* Results */}
      {matches !== null && (
        <div className="animate-slide-up">
          {matches.length === 0 ? (
            <div className="text-center py-10">
              <p
                className="text-xl text-ink mb-2"
                style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
              >
                Marlo&apos;s still scouting.
              </p>
              <p className="text-stone font-body text-sm">
                No programs matched those criteria right now. Try adjusting the schedule or budget.
              </p>
            </div>
          ) : (
            <div>
              <h2
                className="text-lg text-ink mb-3"
                style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
              >
                Marlo&apos;s top 3 for {activeChild?.name}
              </h2>
              <div className="space-y-3">
                {matches.map((match, i) => (
                  <ProgramCard
                    key={match.id}
                    program={match.program}
                    match={match}
                    rank={i + 1}
                    childName={activeChild?.name}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
