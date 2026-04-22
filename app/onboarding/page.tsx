'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MarloWordmark } from '@/components/ui/marlo-wordmark'
import Link from 'next/link'

const INTERESTS = [
  { value: 'soccer',       emoji: '⚽', label: 'Soccer'       },
  { value: 'dance',        emoji: '💃', label: 'Dance'        },
  { value: 'music',        emoji: '🎵', label: 'Music'        },
  { value: 'coding',       emoji: '💻', label: 'Coding'       },
  { value: 'martial arts', emoji: '🥋', label: 'Martial Arts' },
  { value: 'arts',         emoji: '🎨', label: 'Arts'         },
  { value: 'swimming',     emoji: '🏊', label: 'Swim'         },
  { value: 'camp',         emoji: '⛺', label: 'Camp'         },
  { value: 'theater',      emoji: '🎭', label: 'Theater'      },
  { value: 'gymnastics',   emoji: '🤸', label: 'Gymnastics'   },
]

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const NEIGHBORHOODS = [
  'Park Slope', 'Cobble Hill', 'Carroll Gardens',
  'Prospect Heights', 'Boerum Hill', 'Red Hook',
  'Windsor Terrace', 'Gowanus', 'Other',
]

const NEEDS_OPTIONS = [
  { value: 'early_dropoff',                  label: 'Early drop-off'              },
  { value: 'late_pickup',                    label: 'Late pickup'                 },
  { value: 'special_needs_accommodation',    label: 'Special needs accommodation' },
  { value: 'scholarship_needed',             label: 'Scholarship needed'          },
]

type Step = 'welcome' | 'basics' | 'interests' | 'logistics' | 'review' | 'done'

export default function OnboardingPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [step, setStep]         = useState<Step>('welcome')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [addingAnother, setAddingAnother] = useState(false)

  // Form state
  const [childName, setChildName]   = useState('')
  const [childAge, setChildAge]     = useState('')
  const [interests, setInterests]   = useState<string[]>([])
  const [schedule, setSchedule]     = useState<string[]>([])
  const [allergies, setAllergies]   = useState('')
  const [needs, setNeeds]           = useState<string[]>([])
  const [budgetMax, setBudgetMax]   = useState('')
  const [neighborhood, setNeighborhood] = useState('')

  function reset() {
    setChildName(''); setChildAge(''); setInterests([])
    setSchedule([]); setAllergies(''); setNeeds([])
    setBudgetMax(''); setNeighborhood(''); setError(null)
  }

  function toggle<T>(arr: T[], item: T): T[] {
    return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const allergyList = allergies.split(',').map(s => s.trim()).filter(Boolean)

    const { error: err } = await supabase.from('children').insert({
      user_id:      user.id,
      name:         childName,
      age:          parseInt(childAge, 10),
      interests,
      schedule:     schedule.map(d => d.toLowerCase()),
      allergies:    allergyList,
      needs,
      budget_max:   budgetMax ? parseInt(budgetMax, 10) : null,
      neighborhood,
      borough:      'brooklyn',
    })

    if (err) { setError(err.message); setLoading(false); return }

    setStep('done')
    setLoading(false)
  }

  const STEP_ORDER: Step[] = ['welcome', 'basics', 'interests', 'logistics', 'review']
  const stepIndex = STEP_ORDER.indexOf(step)
  const progress  = step === 'done' ? 100 : (stepIndex / (STEP_ORDER.length - 1)) * 100

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <header className="px-4 pt-6 pb-4 flex items-center justify-between">
        <MarloWordmark size={24} />
        {step !== 'welcome' && step !== 'done' && (
          <Link href="/home" className="text-stone text-sm font-body hover:text-ink transition-colors">
            Skip
          </Link>
        )}
      </header>

      {/* Progress bar */}
      {step !== 'welcome' && step !== 'done' && (
        <div className="h-0.5 bg-parchment mx-4 rounded-full overflow-hidden">
          <div
            className="h-full bg-terracotta rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex-1 px-4 py-8 max-w-sm mx-auto w-full">

        {/* ── WELCOME ── */}
        {step === 'welcome' && (
          <div className="animate-fade-in flex flex-col justify-center min-h-[60vh]">
            <h1
              className="text-4xl text-ink leading-tight mb-3"
              style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
            >
              Tell Marlo about your family.
            </h1>
            <p
              className="text-xl text-terracotta mb-2"
              style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
            >
              We&apos;ll handle the rest.
            </p>
            <p className="text-stone font-body text-sm mb-10">
              Answer 4 quick questions and Marlo will find the best programs in Brooklyn — matched to your child, your schedule, and your budget.
            </p>
            <button
              onClick={() => setStep('basics')}
              className="w-full bg-terracotta text-warm-white font-body font-semibold rounded-xl px-4 py-4 text-base hover:bg-terra-light transition-colors"
            >
              Get started →
            </button>
            <p className="text-center text-stone text-xs font-body mt-4">Takes about 2 minutes</p>
          </div>
        )}

        {/* ── STEP 1: BASICS ── */}
        {step === 'basics' && (
          <div className="animate-fade-in space-y-6">
            <div>
              <p className="text-stone text-xs font-body uppercase tracking-widest mb-2">Step 1 of 4</p>
              <h2
                className="text-3xl text-ink leading-tight"
                style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
              >
                Who&apos;s this for?
              </h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-stone text-xs font-body block mb-1.5">Child&apos;s first name</label>
                <input
                  type="text"
                  value={childName}
                  onChange={e => setChildName(e.target.value)}
                  placeholder="e.g. Maya"
                  autoFocus
                  className="w-full bg-warm-white border border-stone-pale rounded-xl px-4 py-3.5 text-ink font-body text-base placeholder:text-stone-light focus:outline-none focus:border-terracotta transition-colors"
                />
              </div>

              <div>
                <label className="text-stone text-xs font-body block mb-1.5">Age</label>
                <div className="flex gap-2 flex-wrap">
                  {Array.from({ length: 14 }, (_, i) => i + 4).map(age => (
                    <button
                      key={age}
                      onClick={() => setChildAge(String(age))}
                      className={`w-10 h-10 rounded-xl text-sm font-body border transition-all ${
                        childAge === String(age)
                          ? 'bg-terracotta border-terracotta text-warm-white'
                          : 'bg-warm-white border-stone-pale text-stone hover:border-terracotta hover:text-terracotta'
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep('interests')}
              disabled={!childName.trim() || !childAge}
              className="w-full bg-terracotta text-warm-white font-body font-semibold rounded-xl px-4 py-3.5 text-sm hover:bg-terra-light transition-colors disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}

        {/* ── STEP 2: INTERESTS + SCHEDULE ── */}
        {step === 'interests' && (
          <div className="animate-fade-in space-y-6">
            <div>
              <p className="text-stone text-xs font-body uppercase tracking-widest mb-2">Step 2 of 4</p>
              <h2
                className="text-3xl text-ink leading-tight"
                style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
              >
                What&apos;s {childName} into?
              </h2>
              <p className="text-stone font-body text-sm mt-1">Pick everything that sounds good.</p>
            </div>

            <div>
              <div className="grid grid-cols-2 gap-2">
                {INTERESTS.map(item => (
                  <button
                    key={item.value}
                    onClick={() => setInterests(toggle(interests, item.value))}
                    className={`flex items-center gap-2 px-3 py-3 rounded-xl border transition-all text-left ${
                      interests.includes(item.value)
                        ? 'bg-terracotta border-terracotta text-warm-white'
                        : 'bg-warm-white border-stone-pale text-ink hover:border-terracotta/50'
                    }`}
                  >
                    <span className="text-lg">{item.emoji}</span>
                    <span className="text-sm font-body font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-stone text-xs font-body block mb-2">Available days</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map(day => (
                  <button
                    key={day}
                    onClick={() => setSchedule(toggle(schedule, day))}
                    className={`px-3 py-1.5 rounded-full text-xs font-body border transition-all ${
                      schedule.includes(day)
                        ? 'bg-ink border-ink text-cream'
                        : 'bg-warm-white border-stone-pale text-stone hover:border-ink hover:text-ink'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('basics')}
                className="flex-1 bg-parchment text-stone font-body rounded-xl px-4 py-3.5 text-sm"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep('logistics')}
                disabled={interests.length === 0 || schedule.length === 0}
                className="flex-1 bg-terracotta text-warm-white font-body font-semibold rounded-xl px-4 py-3.5 text-sm hover:bg-terra-light transition-colors disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: LOGISTICS ── */}
        {step === 'logistics' && (
          <div className="animate-fade-in space-y-6">
            <div>
              <p className="text-stone text-xs font-body uppercase tracking-widest mb-2">Step 3 of 4</p>
              <h2
                className="text-3xl text-ink leading-tight"
                style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
              >
                Anything Marlo should know?
              </h2>
              <p className="text-stone font-body text-sm mt-1">Budget, neighborhood, allergies, and needs.</p>
            </div>

            {/* Neighborhood */}
            <div>
              <label className="text-stone text-xs font-body block mb-2">Neighborhood</label>
              <div className="flex flex-wrap gap-2">
                {NEIGHBORHOODS.map(n => (
                  <button
                    key={n}
                    onClick={() => setNeighborhood(n)}
                    className={`px-3 py-1.5 rounded-full text-xs font-body border transition-all ${
                      neighborhood === n
                        ? 'bg-terracotta border-terracotta text-warm-white'
                        : 'bg-warm-white border-stone-pale text-stone hover:border-terracotta hover:text-terracotta'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="text-stone text-xs font-body block mb-1.5">Monthly budget (optional)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone font-body text-sm">$</span>
                <input
                  type="number"
                  value={budgetMax}
                  onChange={e => setBudgetMax(e.target.value)}
                  placeholder="200"
                  className="w-full bg-warm-white border border-stone-pale rounded-xl pl-8 pr-4 py-3.5 text-ink font-body text-sm placeholder:text-stone-light focus:outline-none focus:border-terracotta transition-colors"
                />
              </div>
            </div>

            {/* Allergies */}
            <div>
              <label className="text-stone text-xs font-body block mb-1.5">Allergies (optional)</label>
              <input
                type="text"
                value={allergies}
                onChange={e => setAllergies(e.target.value)}
                placeholder="e.g. peanuts, tree nuts"
                className="w-full bg-warm-white border border-stone-pale rounded-xl px-4 py-3.5 text-ink font-body text-sm placeholder:text-stone-light focus:outline-none focus:border-terracotta transition-colors"
              />
            </div>

            {/* Special needs */}
            <div>
              <label className="text-stone text-xs font-body block mb-2">Special needs (optional)</label>
              <div className="space-y-2">
                {NEEDS_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setNeeds(toggle(needs, opt.value))}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                      needs.includes(opt.value)
                        ? 'bg-sage-pale border-sage text-ink'
                        : 'bg-warm-white border-stone-pale text-stone hover:border-stone hover:text-ink'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                        needs.includes(opt.value) ? 'bg-sage border-sage' : 'border-stone-pale'
                      }`}
                    >
                      {needs.includes(opt.value) && (
                        <svg className="w-3 h-3 text-warm-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <span className="text-sm font-body">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('interests')}
                className="flex-1 bg-parchment text-stone font-body rounded-xl px-4 py-3.5 text-sm"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep('review')}
                disabled={!neighborhood}
                className="flex-1 bg-terracotta text-warm-white font-body font-semibold rounded-xl px-4 py-3.5 text-sm hover:bg-terra-light transition-colors disabled:opacity-40"
              >
                Review →
              </button>
            </div>
          </div>
        )}

        {/* ── REVIEW ── */}
        {step === 'review' && (
          <div className="animate-fade-in space-y-6">
            <div>
              <p className="text-stone text-xs font-body uppercase tracking-widest mb-2">Step 4 of 4</p>
              <h2
                className="text-3xl text-ink leading-tight"
                style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
              >
                Looks right?
              </h2>
            </div>

            <div className="bg-warm-white rounded-2xl p-5 space-y-4">
              <ReviewRow label="Name" value={childName} />
              <ReviewRow label="Age" value={`${childAge} years old`} />
              <ReviewRow label="Interests" value={interests.join(', ')} />
              <ReviewRow label="Available" value={schedule.join(', ')} />
              <ReviewRow label="Neighborhood" value={neighborhood} />
              {budgetMax && <ReviewRow label="Budget" value={`$${budgetMax}/month`} />}
              {allergies && <ReviewRow label="Allergies" value={allergies} />}
              {needs.length > 0 && (
                <ReviewRow
                  label="Needs"
                  value={needs.map(n => NEEDS_OPTIONS.find(o => o.value === n)?.label ?? n).join(', ')}
                />
              )}
            </div>

            {error && <p className="text-terracotta text-xs font-body">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('logistics')}
                className="flex-1 bg-parchment text-stone font-body rounded-xl px-4 py-3.5 text-sm"
              >
                ← Edit
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-terracotta text-warm-white font-body font-semibold rounded-xl px-4 py-3.5 text-sm hover:bg-terra-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-warm-white/40 border-t-warm-white rounded-full animate-spin" />
                    Marlo&apos;s handling it...
                  </>
                ) : (
                  "Marlo's got it →"
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── DONE / CELEBRATION ── */}
        {step === 'done' && !addingAnother && (
          <div className="animate-slide-up flex flex-col justify-center min-h-[60vh] text-center">
            <div
              className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #C4603A 0%, #E8896A 100%)' }}
            >
              <span className="text-3xl">✓</span>
            </div>
            <h2
              className="text-4xl text-ink mb-2"
              style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
            >
              Marlo&apos;s got it.
            </h2>
            <p
              className="text-xl text-terracotta mb-2"
              style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
            >
              {childName}&apos;s profile is ready.
            </p>
            <p className="text-stone font-body text-sm mb-10">
              Marlo is finding the best programs for {childName} right now.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/home')}
                className="w-full bg-terracotta text-warm-white font-body font-semibold rounded-xl px-4 py-4 text-base hover:bg-terra-light transition-colors"
              >
                See {childName}&apos;s matches →
              </button>
              <button
                onClick={() => {
                  reset()
                  setAddingAnother(true)
                  setStep('basics')
                }}
                className="w-full bg-parchment text-stone font-body rounded-xl px-4 py-3.5 text-sm hover:bg-stone-pale transition-colors"
              >
                + Add another child
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-stone text-xs font-body uppercase tracking-wider flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-ink text-sm font-body text-right capitalize">{value}</span>
    </div>
  )
}
