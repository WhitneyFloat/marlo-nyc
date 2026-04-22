'use client'

import type { Child } from '@/types'

interface ChildSwitcherProps {
  profiles: Child[]
  activeChildId: string
  onChange: (childId: string) => void
}

export function ChildSwitcher({ profiles, activeChildId, onChange }: ChildSwitcherProps) {
  if (profiles.length <= 1) return null

  return (
    <div className="flex items-center gap-2 bg-parchment rounded-full p-1">
      {profiles.map(child => {
        const isActive = child.id === activeChildId
        return (
          <button
            key={child.id}
            onClick={() => onChange(child.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-body font-medium transition-all duration-200 ${
              isActive
                ? 'bg-terracotta text-warm-white shadow-sm'
                : 'text-stone hover:text-ink'
            }`}
          >
            {child.name}
          </button>
        )
      })}
    </div>
  )
}
