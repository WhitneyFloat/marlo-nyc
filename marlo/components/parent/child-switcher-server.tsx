import Link from 'next/link'
import type { Child } from '@/types'

interface ChildSwitcherServerProps {
  profiles:     Child[]
  activeChildId: string
}

// Server-side version for pages where we switch child via URL param
export function ChildSwitcherServer({ profiles, activeChildId }: ChildSwitcherServerProps) {
  if (profiles.length <= 1) return null

  return (
    <div className="flex items-center gap-2 bg-parchment rounded-full p-1">
      {profiles.map(child => {
        const isActive = child.id === activeChildId
        return (
          <Link
            key={child.id}
            href={`?childId=${child.id}`}
            className={`px-4 py-1.5 rounded-full text-sm font-body font-medium transition-all duration-200 ${
              isActive
                ? 'bg-terracotta text-warm-white shadow-sm'
                : 'text-stone hover:text-ink'
            }`}
          >
            {child.name}
          </Link>
        )
      })}
    </div>
  )
}
