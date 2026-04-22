import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { WhyMarloChose } from '@/components/parent/why-marlo-chose'
import { spotsLabel } from '@/lib/utils'

export default async function ProgramPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: program } = await supabase
    .from('programs')
    .select('*, provider:providers(*)')
    .eq('id', params.id)
    .single()

  if (!program) notFound()

  // Find existing match for any of the user's children
  const { data: children } = await supabase
    .from('children')
    .select('id, name')
    .eq('user_id', user.id)

  const childIds = children?.map(c => c.id) ?? []

  const { data: match } = await supabase
    .from('matches')
    .select('*')
    .eq('program_id', params.id)
    .in('child_id', childIds.length ? childIds : ['none'])
    .order('match_score', { ascending: false })
    .limit(1)
    .maybeSingle()

  const matchedChild = match
    ? children?.find(c => c.id === match.child_id)
    : null

  const spotsLeft = program.spots_remaining ?? 0
  const isFull    = spotsLeft === 0

  return (
    <div className="max-w-lg mx-auto px-4 py-6 animate-fade-in">
      {/* Back */}
      <a href="/search" className="text-stone text-sm font-body flex items-center gap-1 mb-6 hover:text-ink transition-colors">
        ← Back
      </a>

      {/* Provider */}
      <p className="text-stone text-xs font-body uppercase tracking-widest mb-1">
        {program.provider?.name}
      </p>

      {/* Program name */}
      <h1
        className="text-3xl text-ink mb-2 leading-tight"
        style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
      >
        {program.name}
      </h1>

      {/* Match score badge */}
      {match && (
        <div className="inline-flex items-center gap-2 bg-sage-pale rounded-full px-4 py-1.5 mb-4">
          <span className="text-sage font-display font-semibold text-lg">{match.match_score}%</span>
          <span className="text-sage text-sm font-body">match</span>
        </div>
      )}

      {/* Key details */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: 'Schedule', value: `${program.schedule_days?.join(', ')} · ${program.schedule_time}` },
          { label: 'Price', value: program.price_monthly ? `$${program.price_monthly}/mo` : `$${program.price_session}/session` },
          { label: 'Ages', value: program.age_min && program.age_max ? `${program.age_min}–${program.age_max} yrs` : 'All ages' },
          { label: 'Location', value: `${program.provider?.neighborhood}, ${program.provider?.borough}` },
        ].map(item => (
          <div key={item.label} className="bg-warm-white rounded-xl p-3">
            <p className="text-stone text-xs font-body mb-0.5">{item.label}</p>
            <p className="text-ink text-sm font-body font-medium">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Tags */}
      {program.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {program.tags.map((tag: string) => (
            <span key={tag} className="text-xs px-3 py-1 rounded-full bg-parchment text-stone font-body">
              {tag.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}

      {/* Description */}
      {program.description && (
        <p className="text-ink font-body text-sm leading-relaxed mb-6">{program.description}</p>
      )}

      {/* Why Marlo Chose panel */}
      {match && matchedChild && (
        <WhyMarloChose
          explanation={match.explanation ?? ''}
          matchReasons={match.match_reasons ?? []}
          childName={matchedChild.name}
        />
      )}

      {/* Spots + CTA */}
      <div className="mt-6 bg-warm-white rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <span
            className={`text-sm font-body font-medium ${isFull ? 'text-stone' : spotsLeft <= 3 ? 'text-terracotta' : 'text-sage'}`}
          >
            {spotsLabel(program.spots_remaining)}
          </span>
          {program.early_dropoff && (
            <span className="text-xs px-2 py-0.5 bg-sage-pale text-sage rounded-full font-body">
              Early drop-off {program.early_dropoff_time}
            </span>
          )}
        </div>

        {isFull ? (
          <button className="w-full bg-parchment text-stone font-body font-semibold rounded-xl px-4 py-3.5 text-sm">
            Join Waitlist
          </button>
        ) : (
          <a
            href={program.provider?.website ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-terracotta text-warm-white font-body font-semibold rounded-xl px-4 py-3.5 text-sm text-center hover:bg-terra-light transition-colors"
          >
            Enroll at {program.provider?.name} →
          </a>
        )}
      </div>
    </div>
  )
}
