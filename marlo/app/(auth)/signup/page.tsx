'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MarloWordmark } from '@/components/ui/marlo-wordmark'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail]     = useState('')
  const [name, setName]       = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/onboarding`,
        data: { name },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  async function handleGoogle() {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/onboarding`,
      },
    })
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-10">
          <MarloWordmark size={36} />
        </div>

        {sent ? (
          <div className="text-center animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-sage-pale flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2
              className="text-2xl text-ink mb-2"
              style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
            >
              Marlo&apos;s got it.
            </h2>
            <p className="text-stone font-body text-sm">
              We sent a link to <span className="font-medium text-ink">{email}</span>.
              <br />Click it to finish setting up your family.
            </p>
          </div>
        ) : (
          <>
            <h1
              className="text-3xl text-ink text-center mb-2"
              style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
            >
              Meet Marlo.
            </h1>
            <p className="text-stone font-body text-sm text-center mb-8">
              Tell Marlo about your family. We&apos;ll handle the rest.
            </p>

            {/* Google OAuth */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-warm-white border border-stone-pale rounded-xl px-4 py-3.5 text-ink font-body text-sm font-medium hover:bg-parchment transition-colors mb-4 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-stone-pale" />
              <span className="text-stone-light text-xs font-body">or</span>
              <div className="flex-1 h-px bg-stone-pale" />
            </div>

            <form onSubmit={handleSignup} className="space-y-3">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-warm-white border border-stone-pale rounded-xl px-4 py-3.5 text-ink font-body text-sm placeholder:text-stone-light focus:outline-none focus:border-terracotta transition-colors"
              />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full bg-warm-white border border-stone-pale rounded-xl px-4 py-3.5 text-ink font-body text-sm placeholder:text-stone-light focus:outline-none focus:border-terracotta transition-colors"
              />
              {error && (
                <p className="text-terracotta text-xs font-body">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-terracotta text-warm-white font-body font-medium rounded-xl px-4 py-3.5 text-sm hover:bg-terra-light transition-colors disabled:opacity-50"
              >
                {loading ? "Marlo's handling it..." : 'Create my account'}
              </button>
            </form>

            <p className="text-xs font-body text-stone text-center mt-4">
              By creating an account, you agree to Marlo&apos;s Terms of Service and Privacy Policy.
            </p>

            <p className="text-center text-stone text-xs font-body mt-4">
              Already have an account?{' '}
              <Link href="/login" className="text-terracotta hover:text-terra-light">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
