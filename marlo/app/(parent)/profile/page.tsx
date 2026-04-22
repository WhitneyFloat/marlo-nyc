import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Child } from '@/types'

const TIER_LABEL: Record<string, string> = {
  free:       'Free',
  family:     'Family — $14.99/mo',
  family_plus: 'Family+ — $24.99/mo',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: childRows } = await supabase
    .from('children')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  const children = (childRows ?? []) as Child[]

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-6 animate-fade-in">
      <h1
        className="text-2xl text-ink"
        style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
      >
        Your family.
      </h1>

      {/* ── Children ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2
            className="text-lg text-ink"
            style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
          >
            Children
          </h2>
          <Link
            href="/onboarding"
            className="text-terracotta text-sm font-body hover:text-terra-light transition-colors"
          >
            + Add child
          </Link>
        </div>

        {children.length === 0 ? (
          <div className="bg-warm-white rounded-2xl p-6 text-center">
            <p className="text-stone font-body text-sm mb-3">No children added yet.</p>
            <Link
              href="/onboarding"
              className="inline-block text-terracotta text-sm font-body hover:text-terra-light transition-colors"
            >
              Set up your first child →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {children.map(child => (
              <Link key={child.id} href={`/profile/child/${child.id}/edit`} className="block">
                <div className="bg-warm-white rounded-2xl p-4 hover:bg-parchment transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-warm-white text-sm font-display"
                        style={{
                          background: 'linear-gradient(135deg, #C4603A 0%, #E8896A 100%)',
                          fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif',
                        }}
                      >
                        {child.name[0]}
                      </div>
                      <div>
                        <p
                          className="text-ink text-base"
                          style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
                        >
                          {child.name}
                        </p>
                        <p className="text-stone text-xs font-body">
                          {child.age} yrs · {child.neighborhood}
                        </p>
                      </div>
                    </div>
                    <span className="text-stone text-xs font-body">Edit →</span>
                  </div>

                  {child.interests?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {child.interests.slice(0, 4).map((i: string) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-parchment text-stone font-body capitalize">
                          {i}
                        </span>
                      ))}
                      {child.interests.length > 4 && (
                        <span className="text-xs text-stone font-body">+{child.interests.length - 4}</span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Saved programs shortcut ── */}
      <Link href="/saved" className="block bg-warm-white rounded-2xl p-4 hover:bg-parchment transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-parchment flex items-center justify-center">
              <svg className="w-4 h-4 text-terracotta" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <span className="text-ink text-sm font-body font-medium">Saved programs</span>
          </div>
          <span className="text-stone text-xs font-body">View →</span>
        </div>
      </Link>

      {/* ── Account ── */}
      <div className="bg-warm-white rounded-2xl p-5">
        <p className="text-stone text-xs font-body uppercase tracking-widest mb-3">Account</p>
        <div className="space-y-2.5">
          <div className="flex justify-between">
            <span className="text-stone font-body text-sm">Email</span>
            <span className="text-ink font-body text-sm truncate ml-4">{user.email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone font-body text-sm">Plan</span>
            <div className="flex items-center gap-2">
              <span className="text-ink font-body text-sm">
                {TIER_LABEL[profile?.subscription_tier ?? 'free'] ?? 'Free'}
              </span>
              {profile?.subscription_tier === 'free' && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-terracotta/10 text-terracotta font-body">
                  Upgrade
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sign out ── */}
      <form action="/api/auth/signout" method="POST">
        <button
          type="submit"
          className="w-full text-stone text-sm font-body py-3 hover:text-terracotta transition-colors"
        >
          Sign out
        </button>
      </form>
    </div>
  )
}
