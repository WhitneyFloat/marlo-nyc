'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { WaitlistAlert } from '@/components/ui/waitlist-alert'

interface WaitlistEntry {
  id: string
  program_id: string
  program_name: string
  child_name: string
}

interface RealtimeWaitlistProps {
  childId:        string
  childName:      string
  initialAlerts?: WaitlistEntry[]
}

export function RealtimeWaitlist({ childId, childName, initialAlerts = [] }: RealtimeWaitlistProps) {
  const [alerts, setAlerts] = useState<WaitlistEntry[]>(initialAlerts)
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to programs.spots_remaining changes for programs on this child's waitlist
    const channel = supabase
      .channel(`waitlist-${childId}`)
      .on(
        'postgres_changes',
        {
          event:  'UPDATE',
          schema: 'public',
          table:  'programs',
        },
        async (payload) => {
          const program = payload.new as { id: string; name: string; spots_remaining: number }
          if ((program.spots_remaining ?? 0) <= 0) return

          // Check if this child is on this program's waitlist and hasn't been claimed
          const { data: entry } = await supabase
            .from('waitlist')
            .select('id, notified_at, claimed_at')
            .eq('child_id', childId)
            .eq('program_id', program.id)
            .is('claimed_at', null)
            .maybeSingle()

          if (!entry) return

          // Show alert if newly notified (notified_at was just set)
          const isNew = !alerts.find(a => a.program_id === program.id)
          if (isNew && entry.notified_at) {
            setAlerts(prev => [
              ...prev,
              {
                id:           entry.id,
                program_id:   program.id,
                program_name: program.name,
                child_name:   childName,
              },
            ])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId, childName])

  function dismiss(programId: string) {
    setAlerts(prev => prev.filter(a => a.program_id !== programId))
  }

  if (!alerts.length) return null

  return (
    <div className="space-y-2">
      {alerts.map(alert => (
        <div key={alert.id} className="relative">
          <WaitlistAlert
            programName={alert.program_name}
            programId={alert.program_id}
            childName={alert.child_name}
          />
          <button
            onClick={() => dismiss(alert.program_id)}
            className="absolute top-3 right-3 text-stone hover:text-ink text-xs"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
