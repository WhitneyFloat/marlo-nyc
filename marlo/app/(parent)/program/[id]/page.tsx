import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { WhyMarloChose } from '@/components/parent/why-marlo-chose'
import { SaveButton } from '@/components/ui/save-button'
import { WaitlistButton } from '@/components/parent/waitlist-button'
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

  // Get user's children
  const { data: children } = await supabase
    .from('children')
    .select('id, name')
    .eq('user_id', user.id)

  const childIds = children?.map(c => c.id) ?? []

  // Best match for any child
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

  const primaryChild = children?.[0]

  // Check save state + waitlist state for primary child
  const savedCheck = primaryChild
    ? await supabase
        .from('saved_programs')
        .select('id')
        .eq('child_id', primaryChild.id)
        .eq('program_id', params.id)
        .maybeSingle()
    : { data: null }

  const waitlistCheck = primaryChild
    ? await supabase
        .from('waitlist')
        .select('id')
        .eq('child_id', primaryChild.id)
        .eq('program_id', params.id)
        .maybeSingle()
    : { data: null }

  const isSaved      = !!savedCheck.data
  const onWaitlist   = !!waitlistCheck.data
  const spotsLeft    = program.spots_remaining ?? 0
  const isFull       = spotsLeft === 0
  const isAlmostFull = spotsLeft > 0 && spotsLeft <= 3

  return (
    <div className="max-w-lg mx-auto px-4 py-6 animate-fade-in pb-24">
      {/* Back */}
      <a href="/search" className="text-stone text-sm font-body flex items-center gap-1 mb-6 hover:text-ink transition-colors">
        ← Back
      </a>

      {/* Provider */}
      <p className="text-stone text-xs font-body uppercase tracking-widest mb-1">
        {program.provider?.name}
      </p>

      {/* Program name + save */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h1
          className="text-3xl text-ink leading-tight"
          style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
        >
          {program.name}
        </h1>
        {primaryChild && (
          <SaveButton
            programId={params.id}
            childId={primaryChild.id}
            saved={isSaved}
            className="flex-shrink-0 mt-1"
          />
        )}
      </div>

      {/* Match score badge */}
      {match && (
        <div className="inline-flex items-center gap-2 bg-sage-pale rounded-full px-4 py-1.5 mb-4">
          <span
            className="text-sage font-semibold text-lg"
            style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
          >
            {match.match_score}%
          </span>
          <span className="text-sage text-sm font-body">match for {matchedChild?.name}</span>
        </div>
      )}

      {/* Key details grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          {
            label: 'Schedule',
            value: [program.schedule_days?.join(', '), program.schedule_time].filter(Boolean).join(' · '),
          },
          {
            label: 'Price',
            value: program.price_monthly
              ? `$${program.price_monthly}/mo`
              : program.price_session
              ? `$${program.price_session}/session`
              : 'Contact for pricing',
          },
          {
            label: 'Ages',
            value: program.age_min && program.age_max
              ? `${program.age_min}–${program.age_max} yrs`
              : 'All ages',
          },
          {
            label: 'Location',
            value: [program.provider?.neighborhood, program.provider?.borough].filter(Boolean).join(', ') || 'Brooklyn',
          },
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
          {program.early_dropoff && (
            <span className="text-xs px-3 py-1 rounded-full bg-sage-pale text-sage font-body">
              Early drop-off {program.early_dropoff_time}
            </span>
          )}
          {program.allergy_safe && (
            <span className="text-xs px-3 py-1 rounded-full bg-sage-pale text-sage font-body">
              Allergy-safe
            </span>
          )}
          {program.scholarship_available && (
            <span className="text-xs px-3 py-1 rounded-full bg-gold-pale text-gold font-body">
              Scholarships available
            </span>
          )}
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

      {/* Why Marlo Chose — non-negotiable */}
      {match && matchedChild && (
        <div className="mb-6">
          <WhyMarloChose
            explanation={match.explanation ?? ''}
            matchReasons={match.match_reasons ?? []}
            childName={matchedChild.name}
          />
        </div>
      )}

      {/* Spots + CTA — sticky on mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-warm-white/95 backdrop-blur-sm border-t border-parchment px-4 py-4 md:static md:bg-transparent md:border-0 md:p-0">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span
              className={`text-sm font-body font-medium ${
                isFull ? 'text-stone' : isAlmostFull ? 'text-terracotta' : 'text-sage'
              }`}
            >
              {spotsLabel(program.spots_remaining)}
            </span>
            {program.provider?.website && (
              <a
                href={program.provider.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone text-xs font-body hover:text-ink transition-colors"
              >
                {program.provider.name} ↗
              </a>
            )}
          </div>

          {primaryChild && isFull ? (
            <WaitlistButton
              programId={params.id}
              childId={primaryChild.id}
              childName={primaryChild.name}
              onWaitlist={onWaitlist}
            />
          ) : program.provider?.website ? (
            <a
              href={program.provider.website}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-terracotta text-warm-white font-body font-semibold rounded-xl px-4 py-3.5 text-sm text-center hover:bg-terra-light transition-colors"
            >
              Enroll at {program.provider?.name} →
            </a>
          ) : (
            <a
              href={`mailto:${program.provider?.contact_email}`}
              className="block w-full bg-terracotta text-warm-white font-body font-semibold rounded-xl px-4 py-3.5 text-sm text-center hover:bg-terra-light transition-colors"
            >
              Contact {program.provider?.name} →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
