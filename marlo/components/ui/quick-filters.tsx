'use client'

export type CategoryFilter = 'all' | 'soccer' | 'dance' | 'music' | 'coding' | 'martial_arts' | 'arts' | 'swim' | 'camp'

const FILTERS: { value: CategoryFilter; label: string; emoji: string }[] = [
  { value: 'all',          label: 'All',          emoji: '✦'  },
  { value: 'soccer',       label: 'Soccer',       emoji: '⚽' },
  { value: 'swim',         label: 'Swim',         emoji: '🏊' },
  { value: 'dance',        label: 'Dance',        emoji: '💃' },
  { value: 'music',        label: 'Music',        emoji: '🎵' },
  { value: 'arts',         label: 'Arts',         emoji: '🎨' },
  { value: 'coding',       label: 'Coding',       emoji: '💻' },
  { value: 'martial_arts', label: 'Martial Arts', emoji: '🥋' },
  { value: 'camp',         label: 'Camp',         emoji: '⛺' },
]

interface QuickFiltersProps {
  active: CategoryFilter
  onChange: (filter: CategoryFilter) => void
}

export function QuickFilters({ active, onChange }: QuickFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
      {FILTERS.map(f => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body font-medium border transition-all duration-200 ${
            active === f.value
              ? 'bg-terracotta border-terracotta text-warm-white'
              : 'bg-warm-white border-stone-pale text-stone hover:border-terracotta hover:text-terracotta'
          }`}
        >
          <span>{f.emoji}</span>
          {f.label}
        </button>
      ))}
    </div>
  )
}
