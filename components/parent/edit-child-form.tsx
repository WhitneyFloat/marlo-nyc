'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Child } from '@/types'

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
  { value: 'early_dropoff',                 label: 'Early drop-off'              },
  { value: 'late_pickup',                   label: 'Late pickup'                 },
  { value: 'special_needs_accommodation',   label: 'Special needs accommodation' },
  { value: 'scholarship_needed',            label: 'Scholarship needed'          },
]

interface EditChildFormProps {
  child: Child
}

export function EditChildForm({ child }: EditChildFormProps) {
  const router   = useRouter()
  const supabase = createClient()

  const [name, setName]             = useState(child.name)
  const [age, setAge]               = useState(String(child.age))
  const [interests, setInterests]   = useState<string[]>(child.interests ?? [])
  const [schedule, setSchedule]     = useState<string[]>(
    (child.schedule ?? []).map(d => d.charAt(0).toUpperCase() + d.slice(1))
  )
  const [allergies, setAllergies]   = useState((child.allergies ?? []).join(', '))
  const [needs, setNeeds]           = useState<string[]>(child.needs ?? [])
  const [budgetMax, setBudgetMax]   = useState(child.budget_max ? String(child.budget_max) : '')
  const [neighborhood, setNeighborhood] = useState(child.neighborhood ?? '')

  const [loading, setLoading]   = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  function toggle<T>(arr: T[], item: T): T[] {
    return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const allergyList = allergies.split(',').map(s => s.trim()).filter(Boolean)

    const { error: err } = await supabase
      .from('children')
      .update({
        name,
        age:          parseInt(age, 10),
        interests,
        schedule:     schedule.map(d => d.toLowerCase()),
        allergies:    allergyList,
        needs,
        budget_max:   budgetMax ? parseInt(budgetMax, 10) : null,
        neighborhood,
      })
      .eq('id', child.id)

    if (err) { setError(err.message); setLoading(false); return }

    // Invalidate old matches so next home load re-runs proactive matching
    await supabase
      .from('matches')
      .delete()
      .eq('child_id', child.id)
      .eq('status', 'active')

    router.push('/profile')
    router.refresh()
  }

  async function handleDelete() {
    setDeleting(true)
    await supabase.from('children').delete().eq('id', child.id)
    router.push('/profile')
    router.refresh()
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto animate-fade-in">
      <a href="/profile" className="text-stone text-sm font-body hover:text-ink transition-colors flex items-center gap-1 mb-6">
        ← Profile
      </a>

      <h1
        className="text-2xl text-ink mb-6"
        style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
      >
        Edit {child.name}&apos;s profile.
      </h1>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Name + Age */}
        <div className="space-y-3">
          <div>
            <label className="text-stone text-xs font-body block mb-1.5">Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-warm-white border border-stone-pale rounded-xl px-4 py-3 text-ink font-body text-sm focus:outline-none focus:border-terracotta transition-colors"
            />
          </div>
          <div>
            <label className="text-stone text-xs font-body block mb-1.5">Age</label>
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: 14 }, (_, i) => i + 4).map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAge(String(a))}
                  className={`w-10 h-10 rounded-xl text-sm font-body border transition-all ${
                    age === String(a)
                      ? 'bg-terracotta border-terracotta text-warm-white'
                      : 'bg-warm-white border-stone-pale text-stone hover:border-terracotta hover:text-terracotta'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="text-stone text-xs font-body block mb-2">Interests</label>
          <div className="grid grid-cols-2 gap-2">
            {INTERESTS.map(item => (
              <button
                key={item.value}
                type="button"
                onClick={() => setInterests(toggle(interests, item.value))}
                className={`flex items-center gap-2 px-3 py-3 rounded-xl border transition-all text-left ${
                  interests.includes(item.value)
                    ? 'bg-terracotta border-terracotta text-warm-white'
                    : 'bg-warm-white border-stone-pale text-ink hover:border-terracotta/50'
                }`}
              >
                <span className="text-base">{item.emoji}</span>
                <span className="text-sm font-body font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Schedule */}
        <div>
          <label className="text-stone text-xs font-body block mb-2">Available days</label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map(day => (
              <button
                key={day}
                type="button"
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

        {/* Neighborhood */}
        <div>
          <label className="text-stone text-xs font-body block mb-2">Neighborhood</label>
          <div className="flex flex-wrap gap-2">
            {NEIGHBORHOODS.map(n => (
              <button
                key={n}
                type="button"
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
          <label className="text-stone text-xs font-body block mb-1.5">Monthly budget</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone font-body text-sm">$</span>
            <input
              type="number"
              value={budgetMax}
              onChange={e => setBudgetMax(e.target.value)}
              placeholder="200"
              className="w-full bg-warm-white border border-stone-pale rounded-xl pl-8 pr-4 py-3 text-ink font-body text-sm focus:outline-none focus:border-terracotta transition-colors"
            />
          </div>
        </div>

        {/* Allergies */}
        <div>
          <label className="text-stone text-xs font-body block mb-1.5">Allergies</label>
          <input
            value={allergies}
            onChange={e => setAllergies(e.target.value)}
            placeholder="peanuts, tree nuts"
            className="w-full bg-warm-white border border-stone-pale rounded-xl px-4 py-3 text-ink font-body text-sm focus:outline-none focus:border-terracotta transition-colors"
          />
        </div>

        {/* Needs */}
        <div>
          <label className="text-stone text-xs font-body block mb-2">Special needs</label>
          <div className="space-y-2">
            {NEEDS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setNeeds(toggle(needs, opt.value))}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                  needs.includes(opt.value)
                    ? 'bg-sage-pale border-sage text-ink'
                    : 'bg-warm-white border-stone-pale text-stone hover:border-stone hover:text-ink'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
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

        {error && <p className="text-terracotta text-xs font-body">{error}</p>}

        <button
          type="submit"
          disabled={loading || !name.trim() || !age}
          className="w-full bg-terracotta text-warm-white font-body font-semibold rounded-xl px-4 py-3.5 text-sm hover:bg-terra-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-warm-white/40 border-t-warm-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            'Save changes'
          )}
        </button>
      </form>

      {/* Delete */}
      <div className="mt-8 pt-6 border-t border-stone-pale">
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-stone text-sm font-body hover:text-terracotta transition-colors"
          >
            Remove {child.name}&apos;s profile
          </button>
        ) : (
          <div className="bg-parchment rounded-xl p-4">
            <p className="text-ink text-sm font-body mb-3">
              Remove {child.name}&apos;s profile? This can&apos;t be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-warm-white text-stone font-body rounded-xl px-4 py-2.5 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-terracotta text-warm-white font-body rounded-xl px-4 py-2.5 text-sm disabled:opacity-50"
              >
                {deleting ? 'Removing...' : 'Yes, remove'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
