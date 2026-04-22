import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ProviderDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Load provider profile (first match on email for MVP)
  const { data: provider } = await supabase
    .from('providers')
    .select('*')
    .eq('contact_email', user.email)
    .maybeSingle()

  if (!provider) {
    return (
      <div className="max-w-lg">
        <h1
          className="text-3xl text-cream mb-3"
          style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
        >
          Welcome to Marlo.
        </h1>
        <p className="text-stone font-body text-sm mb-6">
          Your provider profile isn&apos;t set up yet. Get started to start receiving enrollments.
        </p>
        <Link
          href="/programs/new"
          className="inline-block bg-terracotta text-warm-white font-body font-semibold px-6 py-3 rounded-xl text-sm hover:bg-terra-light transition-colors"
        >
          Set up your profile →
        </Link>
      </div>
    )
  }

  // Load analytics for today
  const { data: analytics } = await supabase
    .from('provider_analytics')
    .select('*')
    .eq('provider_id', provider.id)
    .order('date', { ascending: false })
    .limit(30)

  const totals = analytics?.reduce(
    (acc, row) => ({
      views:    acc.views    + (row.profile_views ?? 0),
      saves:    acc.saves    + (row.saves ?? 0),
      waitlist: acc.waitlist + (row.waitlist_adds ?? 0),
      enrolled: acc.enrolled + (row.enrollments ?? 0),
    }),
    { views: 0, saves: 0, waitlist: 0, enrolled: 0 }
  ) ?? { views: 0, saves: 0, waitlist: 0, enrolled: 0 }

  // Load programs
  const { data: programs } = await supabase
    .from('programs')
    .select('*')
    .eq('provider_id', provider.id)
    .order('created_at', { ascending: false })

  const stats = [
    { label: 'Profile views',    value: totals.views,    sub: 'last 30 days' },
    { label: 'Saved by parents', value: totals.saves,    sub: 'last 30 days' },
    { label: 'Waitlist adds',    value: totals.waitlist, sub: 'last 30 days' },
    { label: 'Enrollments',      value: totals.enrolled, sub: 'last 30 days' },
  ]

  return (
    <div className="max-w-3xl space-y-8 animate-fade-in">
      <div>
        <p className="text-stone text-xs font-body uppercase tracking-widest mb-1">Dashboard</p>
        <h1
          className="text-3xl text-cream"
          style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
        >
          {provider.name}
        </h1>
        {provider.founding_provider && (
          <span className="inline-block mt-2 text-gold text-xs font-body border border-gold/30 rounded-full px-3 py-0.5">
            Founding Provider
          </span>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(stat => (
          <div
            key={stat.label}
            className="rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <p className="text-3xl text-cream font-display mb-1"
              style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
            >
              {stat.value.toLocaleString()}
            </p>
            <p className="text-stone text-xs font-body">{stat.label}</p>
            <p className="text-stone-light text-xs font-body mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Programs list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-xl text-cream"
            style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
          >
            Your programs
          </h2>
          <Link
            href="/programs/new"
            className="text-terracotta text-sm font-body hover:text-terra-light transition-colors"
          >
            + Add program
          </Link>
        </div>

        {!programs?.length ? (
          <div
            className="rounded-2xl p-6 text-center"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <p className="text-stone font-body text-sm">No programs yet.</p>
            <Link
              href="/programs/new"
              className="inline-block mt-3 text-terracotta text-sm font-body hover:text-terra-light"
            >
              Add your first program →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {programs.map(program => (
              <div
                key={program.id}
                className="rounded-2xl p-4 flex items-center justify-between"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <div>
                  <p className="text-cream font-body text-sm font-medium">{program.name}</p>
                  <p className="text-stone text-xs font-body mt-0.5">
                    {program.category} · {program.spots_remaining ?? '?'} spots left
                    {program.price_monthly ? ` · $${program.price_monthly}/mo` : ''}
                  </p>
                </div>
                <span
                  className={`text-xs font-body px-2 py-0.5 rounded-full ${
                    program.active ? 'text-sage bg-sage/10' : 'text-stone bg-stone/10'
                  }`}
                >
                  {program.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
