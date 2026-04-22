'use client'

import Link from 'next/link'
import type { Program, Match } from '@/types'
import { spotsLabel, matchScoreLabel } from '@/lib/utils'

interface ProgramCardProps {
  program: Program
  match?: Match
  rank?: number
  childName?: string
}

const CATEGORY_COLOR: Record<string, string> = {
  soccer:       '#6B9E70',
  dance:        '#C4603A',
  music:        '#C9A44C',
  coding:       '#4A7FA5',
  martial_arts: '#8C5E3C',
  arts:         '#C4603A',
  swim:         '#4A7FA5',
  camp:         '#6B9E70',
}

export function ProgramCard({ program, match, rank, childName }: ProgramCardProps) {
  const accentColor = CATEGORY_COLOR[program.category] ?? '#8C8478'
  const spotsLeft   = program.spots_remaining ?? 0
  const isFull      = spotsLeft === 0
  const isAlmostFull = spotsLeft > 0 && spotsLeft <= 3

  return (
    <Link href={`/program/${program.id}`} className="block">
      <div className="bg-warm-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 animate-fade-in">
        {/* Accent bar */}
        <div className="h-1" style={{ background: accentColor }} />

        <div className="p-5">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              {rank && (
                <div className="text-xs font-body text-stone mb-1 uppercase tracking-wider">
                  Match #{rank}
                </div>
              )}
              <h3
                className="font-display text-ink text-lg leading-tight truncate"
                style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
              >
                {program.name}
              </h3>
              <p className="text-stone text-sm mt-0.5 font-body">
                {program.provider?.neighborhood ?? ''} · {program.category.replace('_', ' ')}
              </p>
            </div>

            {match && (
              <div
                className="flex-shrink-0 rounded-xl px-3 py-2 text-center"
                style={{ background: `${accentColor}20` }}
              >
                <div
                  className="text-xl font-display font-semibold leading-none"
                  style={{ color: accentColor, fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
                >
                  {match.match_score}%
                </div>
                <div className="text-xs text-stone font-body mt-0.5">match</div>
              </div>
            )}
          </div>

          {/* Schedule + Price */}
          <div className="flex items-center gap-4 mb-3 text-sm font-body text-ink">
            {program.schedule_days?.length > 0 && (
              <span>{program.schedule_days.map(d => d.slice(0, 3)).join(', ')}</span>
            )}
            {program.schedule_time && <span>{program.schedule_time}</span>}
            {program.price_monthly && (
              <span className="ml-auto font-semibold text-ink">${program.price_monthly}/mo</span>
            )}
          </div>

          {/* Tags */}
          {program.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {program.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full bg-parchment text-stone font-body"
                >
                  {tag.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}

          {/* Spots */}
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-body font-medium ${
                isFull
                  ? 'text-stone'
                  : isAlmostFull
                  ? 'text-terracotta'
                  : 'text-sage'
              }`}
            >
              {spotsLabel(program.spots_remaining)}
            </span>

            {match && childName && (
              <span className="text-xs text-stone font-body italic">
                {matchScoreLabel(match.match_score)} for {childName}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
