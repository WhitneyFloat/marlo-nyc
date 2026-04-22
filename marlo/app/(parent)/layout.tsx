import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MarloWordmark } from '@/components/ui/marlo-wordmark'
import Link from 'next/link'

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Mobile nav header */}
      <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-sm border-b border-parchment px-4 py-3 flex items-center justify-between">
        <MarloWordmark size={24} />
        <Link
          href="/profile"
          className="w-8 h-8 rounded-full bg-parchment flex items-center justify-center text-stone hover:bg-stone-pale transition-colors"
          aria-label="Profile"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </Link>
      </header>

      {/* Page content */}
      <main className="flex-1">{children}</main>

      {/* Bottom tab bar — mobile */}
      <nav className="sticky bottom-0 z-40 bg-warm-white/95 backdrop-blur-sm border-t border-parchment px-2 py-2 safe-area-pb">
        <div className="flex items-center justify-around max-w-sm mx-auto">
          <NavTab href="/home" label="Home" icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          } />
          <NavTab href="/search" label="Search" icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          } />
          <NavTab href="/profile" label="Family" icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          } />
        </div>
      </nav>
    </div>
  )
}

function NavTab({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-0.5 px-4 py-1 text-stone hover:text-terracotta transition-colors group"
    >
      <span className="group-hover:text-terracotta transition-colors">{icon}</span>
      <span className="text-xs font-body">{label}</span>
    </Link>
  )
}
