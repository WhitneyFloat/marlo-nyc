import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MarloWordmark } from '@/components/ui/marlo-wordmark'
import Link from 'next/link'

export default async function ProviderLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen flex" style={{ background: '#2C2B28' }}>
      {/* Sidebar — desktop */}
      <aside
        className="hidden md:flex flex-col w-56 border-r py-8 px-5"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#1A1917' }}
      >
        <div className="mb-10">
          <MarloWordmark size={22} light />
          <p className="text-stone text-xs font-body mt-1 uppercase tracking-wider">Provider</p>
        </div>

        <nav className="flex-1 space-y-1">
          {[
            { href: '/dashboard',       label: 'Dashboard' },
            { href: '/programs',        label: 'Programs' },
            { href: '/programs/new',    label: 'Add program' },
            { href: '/settings',        label: 'Settings' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2.5 rounded-xl text-stone hover:text-cream hover:bg-white/5 text-sm font-body transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-stone text-xs font-body truncate">{user.email}</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header
          className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#1A1917' }}
        >
          <MarloWordmark size={20} light />
          <span className="text-stone text-xs font-body uppercase tracking-wider">Provider</span>
        </header>

        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  )
}
