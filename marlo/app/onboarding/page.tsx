'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MarloWordmark } from '@/components/ui/marlo-wordmark'

const INTERESTS = ['soccer', 'dance', 'music', 'coding', 'martial arts', 'arts & crafts', 'swimming', 'camp']
const DAYS      = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const NEIGHBORHOODS = ['Park Slope', 'Cobble Hill', 'Carroll Gardens', 'Prospect Heights', 'Boerum Hill', 'Red Hook', 'Other']

type Step = 1 | 2 | 3 | 4

export default function OnboardingPage() {
  const router  = useRouter()
  const supabase = createClient()

  const [step, setStep]     = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  // Form state
  const [childName, setChildName]   = useState('')
  const [childAge, setChildAge]     = useState('')
  const [interests, setInterests]   = useState<string[]>([])
  const [schedule, setSchedule]     = useState<string[]>([])
  const [allergies, setAllergies]   = useState('')
  const [needs, setNeeds]           = useState<string[]>([])
  const [budgetMax, setBudgetMax]   = useState('')
  const [neighborhood, setNeighborhood] = useState('')

  function toggleArray<T>(arr: T[], item: T): T[] {
    return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const allergyList = allergies
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    const { error } = await supabase.from('children').insert({
      user_id:     user.id,
      name:        childName,
      age:         parseInt(childAge, 10),
      interests,
      schedule:    schedule.map(d => d.toLowerCase()),
      allergies:   allergyList,
      needs,
      budget_max:  budgetMax ? parseInt(budgetMax, 10) : null,
      neighborhood,
      borough:     'brooklyn',
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/home')
  }

  const progress = (step / 4) * 100

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="px-4 pt-6 pb-4">
        <MarloWordmark size={24} />
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-parchment mx-4 rounded-full overflow-hidden">
        <div
          className="h-full bg-terracotta rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 px-4 py-8 max-w-sm mx-auto w-full">

        {/* Step 1 — Child basics */}
        {step === 1 && (
          <div className="animate-fade-in space-y-6">
            <div>
              <p className="text-stone text-xs font-body uppercase tracking-widest mb-2">Step 1 of 4</p>
              <h1
                className="text-3xl text-ink leading-tight"
                style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
              >
                Tell Marlo about your family.
              </h1>
              <p className="text-stone font-body text-sm mt-2">We&apos;ll handle the rest.</p>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={childName}
                onChange={e => setChildName(e.target.value)}
                placeholder="Child's first name"
                className="w-full bg-warm-white border border-stone-pale rounded-xl px-4 py-3.5 text-ink font-body text-sm placeholder:text-stone-light focus:outline-none focus:border-terracotta transition-colors"
              />
              <input
                type="number"
                value={childAge}
                onChange={e => setChildAge(e.target.value)}
                placeholder="Age"
                min={2}
                max={18}
                className="w-full bg-warm-white border border-stone-pale rounded-xl px-4 py-3.5 text-ink font-body text-sm placeholder:text-stone-light focus:outline-none focus:border-terracotta transition-colors"
              />
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!childName || !childAge}
              className="w-full bg-terracotta text-warm-white font-body font-semibold rounded-xl px-4 py-3.5 text-sm hover:bg-terra-light transition-colors disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        )}

        {/* Step 2 — Interests + schedule */}
        {step === 2 && (
          <div className="animate-fade-in space-y-6">
            <div>
              <p className="text-stone text-xs font-body uppercase tracking-widest mb-2">Step 2 of 4</p>
              <h1
                className="text-3xl text-ink leading-tight"
                style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
              >
                What&apos;s {childName} into?
              </h1>
            </div>

            <div>
              <p className="text-stone font-body text-xs mb-2">Interests (pick all that apply)</p>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map(interest => (
                  <button
                    key={interest}
                    onClick={() => setInterests(toggleArray(interests, interest))}
                    className={`px-3 py-1.5 rounded-full text-sm font-body border transition-all ${
                      interests.includes(interest)
                        ? 'bg-terracotta border-terracotta text-warm-white'
                        : 'bg-warm-white border-stone-pale text-stone hover:border-terracotta hover:text-terracotta'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-stone font-body text-xs mb-2">Available days</p>
              <div className="flex flex-wrap gap-2">
                {DAYS.map(day => (
                  <button
                    key={day}
                    onClick={() => setSchedule(toggleArray(schedule, day))}
                    className={`px-3 py-1.5 rounded-full text-sm font-body border transition-all ${
                      schedule.includes(day)
                        ? 'bg-terracotta border-terracotta text-warm-white'
                        : 'bg-warm-white border-stone-pale text-stone hover:border-terracotta hover:text-terracotta'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-parchment text-stone font-body rounded-xl px-4 py-3.5 text-sm"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={interests.length === 0}
                className="flex-1 bg-terracotta text-warm-white font-body font-semibold rounded-xl px-4 py-3.5 text-sm hover:bg-terra-light transition-colors disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Allergies + needs */}
        {step === 3 && (
          <div className="animate-fade-in space-y-6">
            <div>
              <p className="text-stone text-xs font-body uppercase tracking-widest mb-2">Step 3 of 4</p>
              <h1
                className="text-3xl text-ink leading-tight"
                style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
              >
                Anything Marlo should know?
              </h1>
              <p className="text-stone font-body text-sm mt-2">
                Allergies, accommodations, or early drop-off needs.
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={allergies}
                onChange={e => setAllergies(e.target.value)}
                placeholder="Allergies (e.g. peanuts, tree nuts)"
                className="w-full bg-warm-white border border-stone-pale rounded-xl px-4 py-3.5 text-ink font-body text-sm placeholder:text-stone-light focus:outline-none focus:border-terracotta transition-colors"
              />
            </div>

            <div>
              <p className="text-stone font-body text-xs mb-2">Special needs (pick any)</p>
              <div className="flex flex-wrap gap-2">
                {['Early drop-off', 'Late pickup', 'Special needs accommodation', 'Scholarship needed'].map(need => (
                  <button
                    key={need}
                    onClick={() => setNeeds(toggleArray(needs, need.toLowerCase().replace(/ /g, '_')))}
                    className={`px-3 py-1.5 rounded-full text-sm font-body border transition-all ${
                      needs.includes(need.toLowerCase().replace(/ /g, '_'))
                        ? 'bg-terracotta border-terracotta text-warm-white'
                        : 'bg-warm-white border-stone-pale text-stone hover:border-terracotta hover:text-terracotta'
                    }`}
                  >
                    {need}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-parchment text-stone font-body rounded-xl px-4 py-3.5 text-sm"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex-1 bg-terracotta text-warm-white font-body font-semibold rounded-xl px-4 py-3.5 text-sm hover:bg-terra-light transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 4 — Budget + neighborhood */}
        {step === 4 && (
          <div className="animate-fade-in space-y-6">
            <div>
              <p className="text-stone text-xs font-body uppercase tracking-widest mb-2">Step 4 of 4</p>
              <h1
                className="text-3xl text-ink leading-tight"
                style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
              >
                Almost there.
              </h1>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-stone font-body text-xs block mb-1.5">Monthly budget (optional)</label>
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

              <div>
                <label className="text-stone font-body text-xs block mb-1.5">Neighborhood</label>
                <div className="flex flex-wrap gap-2">
                  {NEIGHBORHOODS.map(n => (
                    <button
                      key={n}
                      onClick={() => setNeighborhood(n)}
                      className={`px-3 py-1.5 rounded-full text-sm font-body border transition-all ${
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
            </div>

            {error && <p className="text-terracotta text-xs font-body">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-parchment text-stone font-body rounded-xl px-4 py-3.5 text-sm"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !neighborhood}
                className="flex-1 bg-terracotta text-warm-white font-body font-semibold rounded-xl px-4 py-3.5 text-sm hover:bg-terra-light transition-colors disabled:opacity-50"
              >
                {loading ? "Marlo's handling it..." : "Marlo's got it →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
