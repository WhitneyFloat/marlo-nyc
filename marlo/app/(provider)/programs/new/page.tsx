'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = ['soccer', 'dance', 'music', 'coding', 'martial_arts', 'arts', 'swim', 'camp']
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function NewProgramPage() {
  const router  = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const [name, setName]           = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory]   = useState('')
  const [scheduleDays, setScheduleDays] = useState<string[]>([])
  const [scheduleTime, setScheduleTime] = useState('')
  const [priceMonthly, setPriceMonthly] = useState('')
  const [capacity, setCapacity]   = useState('')
  const [ageMin, setAgeMin]       = useState('')
  const [ageMax, setAgeMax]       = useState('')
  const [earlyDropoff, setEarlyDropoff] = useState(false)
  const [earlyDropoffTime, setEarlyDropoffTime] = useState('')
  const [allergySafe, setAllergySafe] = useState(false)

  function toggle<T>(arr: T[], item: T): T[] {
    return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // Get or create provider
    let { data: provider } = await supabase
      .from('providers')
      .select('id')
      .eq('contact_email', user.email)
      .maybeSingle()

    if (!provider) {
      const { data: newProvider, error: providerError } = await supabase
        .from('providers')
        .insert({ name: 'My Organization', category, contact_email: user.email })
        .select('id')
        .single()

      if (providerError || !newProvider) {
        setError(providerError?.message ?? 'Could not create provider')
        setLoading(false)
        return
      }
      provider = newProvider
    }

    const { error: insertError } = await supabase.from('programs').insert({
      provider_id:       provider.id,
      name,
      description,
      category,
      schedule_days:     scheduleDays.map(d => d.toLowerCase()),
      schedule_time:     scheduleTime,
      price_monthly:     priceMonthly ? parseInt(priceMonthly, 10) : null,
      capacity:          capacity ? parseInt(capacity, 10) : null,
      spots_remaining:   capacity ? parseInt(capacity, 10) : null,
      age_min:           ageMin ? parseInt(ageMin, 10) : null,
      age_max:           ageMax ? parseInt(ageMax, 10) : null,
      early_dropoff:     earlyDropoff,
      early_dropoff_time: earlyDropoffTime || null,
      allergy_safe:      allergySafe,
      tags:              [],
      active:            true,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="max-w-lg">
      <p className="text-stone text-xs font-body uppercase tracking-widest mb-1">New program</p>
      <h1
        className="text-3xl text-cream mb-6"
        style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
      >
        Add a program.
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Program name */}
        <div>
          <label className="text-stone text-xs font-body block mb-1.5">Program name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Brooklyn Soccer Academy — Fall Session"
            required
            className="w-full rounded-xl px-4 py-3 text-sm font-body bg-white/5 border border-white/10 text-cream placeholder:text-stone focus:outline-none focus:border-terracotta/60 transition-colors"
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-stone text-xs font-body block mb-1.5">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-body border transition-all ${
                  category === cat
                    ? 'bg-terracotta border-terracotta text-warm-white'
                    : 'border-white/10 text-stone hover:border-terracotta/40 hover:text-cream'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule */}
        <div>
          <label className="text-stone text-xs font-body block mb-1.5">Days</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {DAYS.map(day => (
              <button
                key={day}
                type="button"
                onClick={() => setScheduleDays(toggle(scheduleDays, day))}
                className={`px-3 py-1.5 rounded-full text-xs font-body border transition-all ${
                  scheduleDays.includes(day)
                    ? 'bg-terracotta border-terracotta text-warm-white'
                    : 'border-white/10 text-stone hover:border-terracotta/40 hover:text-cream'
                }`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
          <input
            value={scheduleTime}
            onChange={e => setScheduleTime(e.target.value)}
            placeholder="Time (e.g. 9:00 AM – 11:00 AM)"
            className="w-full rounded-xl px-4 py-3 text-sm font-body bg-white/5 border border-white/10 text-cream placeholder:text-stone focus:outline-none focus:border-terracotta/60 transition-colors"
          />
        </div>

        {/* Price + capacity */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-stone text-xs font-body block mb-1.5">Monthly price ($)</label>
            <input
              type="number"
              value={priceMonthly}
              onChange={e => setPriceMonthly(e.target.value)}
              placeholder="180"
              className="w-full rounded-xl px-4 py-3 text-sm font-body bg-white/5 border border-white/10 text-cream placeholder:text-stone focus:outline-none focus:border-terracotta/60 transition-colors"
            />
          </div>
          <div>
            <label className="text-stone text-xs font-body block mb-1.5">Capacity</label>
            <input
              type="number"
              value={capacity}
              onChange={e => setCapacity(e.target.value)}
              placeholder="20"
              className="w-full rounded-xl px-4 py-3 text-sm font-body bg-white/5 border border-white/10 text-cream placeholder:text-stone focus:outline-none focus:border-terracotta/60 transition-colors"
            />
          </div>
        </div>

        {/* Age range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-stone text-xs font-body block mb-1.5">Min age</label>
            <input
              type="number"
              value={ageMin}
              onChange={e => setAgeMin(e.target.value)}
              placeholder="6"
              className="w-full rounded-xl px-4 py-3 text-sm font-body bg-white/5 border border-white/10 text-cream placeholder:text-stone focus:outline-none focus:border-terracotta/60 transition-colors"
            />
          </div>
          <div>
            <label className="text-stone text-xs font-body block mb-1.5">Max age</label>
            <input
              type="number"
              value={ageMax}
              onChange={e => setAgeMax(e.target.value)}
              placeholder="12"
              className="w-full rounded-xl px-4 py-3 text-sm font-body bg-white/5 border border-white/10 text-cream placeholder:text-stone focus:outline-none focus:border-terracotta/60 transition-colors"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-stone text-xs font-body block mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Tell parents what makes this program special..."
            rows={3}
            className="w-full rounded-xl px-4 py-3 text-sm font-body bg-white/5 border border-white/10 text-cream placeholder:text-stone focus:outline-none focus:border-terracotta/60 transition-colors resize-none"
          />
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          {[
            { label: 'Early drop-off available', value: earlyDropoff, onChange: setEarlyDropoff },
            { label: 'Allergy-safe facility', value: allergySafe, onChange: setAllergySafe },
          ].map(toggle => (
            <label key={toggle.label} className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => toggle.onChange(!toggle.value)}
                className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${
                  toggle.value ? 'bg-terracotta' : 'bg-white/10'
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    toggle.value ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </div>
              <span className="text-stone text-sm font-body">{toggle.label}</span>
            </label>
          ))}
        </div>

        {earlyDropoff && (
          <input
            value={earlyDropoffTime}
            onChange={e => setEarlyDropoffTime(e.target.value)}
            placeholder="Drop-off time (e.g. 7:45 AM)"
            className="w-full rounded-xl px-4 py-3 text-sm font-body bg-white/5 border border-white/10 text-cream placeholder:text-stone focus:outline-none focus:border-terracotta/60 transition-colors"
          />
        )}

        {error && <p className="text-terracotta text-xs font-body">{error}</p>}

        <button
          type="submit"
          disabled={loading || !name || !category}
          className="w-full bg-terracotta text-warm-white font-body font-semibold rounded-xl px-4 py-3.5 text-sm hover:bg-terra-light transition-colors disabled:opacity-50"
        >
          {loading ? "Marlo's handling it..." : 'Add program'}
        </button>
      </form>
    </div>
  )
}
