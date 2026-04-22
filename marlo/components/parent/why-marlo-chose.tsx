'use client'

const REASON_LABELS: Record<string, string> = {
  schedule_fit:    'Schedule fits',
  allergy_safe:    'Allergy-safe',
  interest_align:  'Matches interests',
  budget_match:    'Within budget',
  location_match:  'Close to home',
  early_dropoff:   'Early drop-off',
  scholarship:     'Scholarship available',
}

interface WhyMarloChoseProps {
  explanation: string
  matchReasons: string[]
  childName: string
}

export function WhyMarloChose({ explanation, matchReasons, childName }: WhyMarloChoseProps) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: '#F8F4EE', borderLeft: '3px solid #C4603A' }}
    >
      <p className="text-stone text-xs font-body uppercase tracking-widest mb-2">
        Why Marlo chose this for {childName}
      </p>

      {explanation && (
        <p className="text-ink font-body text-sm leading-relaxed mb-4">{explanation}</p>
      )}

      {matchReasons.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {matchReasons.map(reason => (
            <span
              key={reason}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-body"
              style={{ background: '#C4603A20', color: '#C4603A' }}
            >
              <span>✓</span>
              {REASON_LABELS[reason] ?? reason.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
