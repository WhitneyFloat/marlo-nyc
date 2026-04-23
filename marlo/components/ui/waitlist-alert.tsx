'use client'

import Link from 'next/link'

interface WaitlistAlertProps {
  programName: string
  programId:   string
  childName:   string
}

export function WaitlistAlert({ programName, programId, childName }: WaitlistAlertProps) {
  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-4 animate-fade-in"
      style={{ background: '#D4EAD6', borderLeft: '3px solid #6B9E70' }}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sage flex items-center justify-center">
        <svg className="w-4 h-4 text-warm-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-ink text-sm font-body font-medium">
          Marlo found a spot.{' '}
          <Link
            href={`/program/${programId}`}
            className="text-sage underline underline-offset-2 hover:text-sage-light"
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
