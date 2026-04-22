import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MarloWordmark } from '@/components/ui/marlo-wordmark'
import { NavBar } from '@/components/parent/nav-bar'

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Mobile nav header */}
      <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-sm border-b border-parchment px-4 py-3 flex items-center justify-between">
        <MarloWordmark size={24} />
        <a
          href="/profile"
          className="w-8 h-8 rounded-full bg-parchment flex items-center justify-center text-stone hover:bg-stone-pale transition-colors"
          aria-label="Profile"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </a>
      </header>

      {/* Page content */}
      <main className="flex-1">{children}</main>

      {/* Bottom tab bar — client component for active highlighting */}
      <NavBar />
    </div>
  )
}
