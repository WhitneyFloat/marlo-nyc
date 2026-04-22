'use client'

import { useState, useTransition } from 'react'

interface SaveButtonProps {
  programId: string
  childId:   string
  saved:     boolean
  className?: string
}

export function SaveButton({ programId, childId, saved: initialSaved, className = '' }: SaveButtonProps) {
  const [saved, setSaved]         = useState(initialSaved)
  const [isPending, startTransition] = useTransition()

  async function toggle() {
    const prev = saved
    setSaved(!prev)

    startTransition(async () => {
      try {
        if (prev) {
          await fetch(`/api/saved-programs?childId=${childId}&programId=${programId}`, {
            method: 'DELETE',
          })
        } else {
          await fetch('/api/saved-programs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ childId, programId }),
          })
        }
      } catch {
        setSaved(prev)
      }
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      aria-label={saved ? 'Unsave program' : 'Save program'}
      className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 ${
        saved
          ? 'bg-terracotta text-warm-white'
          : 'bg-parchment text-stone hover:bg-stone-pale hover:text-ink'
      } ${className}`}
    >
      <svg
        className="w-4 h-4"
        fill={saved ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={saved ? 0 : 2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
    </button>
  )
}
