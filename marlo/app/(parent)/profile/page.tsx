import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: children } = await supabase
    .from('children')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-6 animate-fade-in">
      <h1
        className="text-2xl text-ink"
        style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
      >
        Your family.
      </h1>

      {/* Account */}
      <div className="bg-warm-white rounded-2xl p-5">
        <p className="text-stone text-xs font-body uppercase tracking-widest mb-3">Account</p>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-stone font-body text-sm">Email</span>
            <span className="text-ink font-body text-sm">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone font-body text-sm">Plan</span>
            <span className="text-ink font-body text-sm capitalize">
              {profile?.subscription_tier?.replace('_', ' ') ?? 'Free'}
            </span>
          </div>
        </div>
      </div>

      {/* Children */}
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
        <div className="space-y-3">
          {children?.map(child => (
            <div key={child.id} className="bg-warm-white rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3
                  className="text-ink font-display text-base"
                  style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
                >
                  {child.name}
                </h3>
                <span className="text-stone text-sm font-body">{child.age} yrs · {child.neighborhood}</span>
              </div>
              {child.interests?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {child.interests.map((i: string) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-parchment text-stone font-body capitalize">
                      {i}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sign out */}
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
