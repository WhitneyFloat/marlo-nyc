'use client'

import Link from 'next/link'

interface WaitlistAlertProps {
  programName: string
  programId: string
  childName: string
}

export function WaitlistAlert({ programName, programId, childName }: WaitlistAlertProps) {
  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-4 animate-fade-in"
      style={{ background: '#FBF3DC', borderLeft: '3px solid #C9A44C' }}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gold-pale flex items-center justify-center">
        <span className="text-gold text-sm">!</span>
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-ink text-sm font-body font-medium"
        >
          Marlo found a spot.{' '}
          <Link
            href={`/program/${programId}`}
            className="text-terracotta underline underline-offset-2 hover:text-terra-light"
          >
            Tap to claim it.
          </Link>
        </p>
        <p className="text-stone text-xs font-body mt-0.5">
          {programName} · for {childName} · 2-hour claim window
        </p>
      </div>
    </div>
  )
}
