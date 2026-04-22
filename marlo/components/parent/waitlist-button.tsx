'use client'

import { useState } from 'react'

interface WaitlistButtonProps {
  programId:  string
  childId:    string
  childName:  string
  onWaitlist: boolean
}

export function WaitlistButton({ programId, childId, childName, onWaitlist: initial }: WaitlistButtonProps) {
  const [onWaitlist, setOnWaitlist] = useState(initial)
  const [loading, setLoading]       = useState(false)
  const [joined, setJoined]         = useState(false)

  async function handleJoin() {
    setLoading(true)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId, programId }),
      })
      if (res.ok) {
        setOnWaitlist(true)
        setJoined(true)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleLeave() {
    setLoading(true)
    try {
      await fetch(`/api/waitlist?childId=${childId}&programId=${programId}`, {
        method: 'DELETE',
      })
      setOnWaitlist(false)
      setJoined(false)
    } finally {
      setLoading(false)
    }
  }

  if (joined) {
    return (
      <div className="w-full bg-sage-pale rounded-xl px-4 py-3.5 text-center animate-fade-in">
        <p
          className="text-sage text-sm font-body font-medium"
        >
          Marlo&apos;s got it. We&apos;ll alert you the moment a spot opens for {childName}.
        </p>
      </div>
    )
  }

  if (onWaitlist) {
    return (
      <div className="space-y-2">
        <div className="w-full bg-gold-pale rounded-xl px-4 py-3.5 text-center">
          <p className="text-gold text-sm font-body font-medium">
            {childName} is on the waitlist. Marlo&apos;s watching.
          </p>
        </div>
        <button
          onClick={handleLeave}
          disabled={loading}
          className="w-full text-stone text-xs font-body py-2 hover:text-terracotta transition-colors"
        >
          Leave waitlist
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleJoin}
      disabled={loading}
      className="w-full bg-ink text-cream font-body font-semibold rounded-xl px-4 py-3.5 text-sm hover:bg-ink-soft transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-cream/40 border-t-cream rounded-full animate-spin" />
          Joining waitlist...
        </>
      ) : (
        `Join waitlist for ${childName}`
      )}
    </button>
  )
}
