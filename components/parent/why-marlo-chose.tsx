'use client'

// Reasons that feel "growth / fit" get sage; practical/safety reasons get terracotta
const SAGE_REASONS    = new Set(['interest_align', 'location_match', 'schedule_fit'])
const REASON_LABELS: Record<string, string> = {
  schedule_fit:   'Schedule fits',
  allergy_safe:   'Allergy-safe',
  interest_align: 'Matches interests',
  budget_match:   'Within budget',
  location_match: 'Close to home',
  early_dropoff:  'Early drop-off',
  scholarship:    'Scholarship available',
}

interface WhyMarloChoseProps {
  explanation:  string
  matchReasons: string[]
  childName:    string
}

export function WhyMarloChose({ explanation, matchReasons, childName }: WhyMarloChoseProps) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: '#F8F4EE', borderLeft: '3px solid #6B9E70' }}
    >
      <p className="text-stone text-xs font-body uppercase tracking-widest mb-2">
        Why Marlo chose this for {childName}
      </p>

      {explanation && (
        <p className="text-ink font-body text-sm leading-relaxed mb-4">{explanation}</p>
      )}

      {matchReasons.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {matchReasons.map(reason => {
            const isSage = SAGE_REASONS.has(reason)
            return (
              <span
                key={reason}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-body"
                style={
                  isSage
                    ? { background: '#6B9E7020', color: '#6B9E70' }
                    : { background: '#C4603A20', color: '#C4603A' }
                }
              >
                <span>✓</span>
                {REASON_LABELS[reason] ?? reason.replace(/_/g, ' ')}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
