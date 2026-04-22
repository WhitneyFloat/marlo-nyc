'use client'

import Link from 'next/link'

interface MatchBannerProps {
  childName: string
  matchCount: number
  query?: string
}

export function MatchBanner({ childName, matchCount, query }: MatchBannerProps) {
  return (
    <div
      className="rounded-2xl p-6 animate-fade-in"
      style={{ background: 'linear-gradient(135deg, #C4603A 0%, #E8896A 100%)' }}
    >
      <p className="text-warm-white text-xs uppercase tracking-widest mb-2 font-body opacity-80">
        Marlo&apos;s picks
      </p>
      <h2
        className="text-warm-white text-2xl leading-tight mb-4"
        style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
      >
        Marlo found {matchCount} {matchCount === 1 ? 'match' : 'matches'} for {childName} this week.
      </h2>
      <Link
        href={`/search${query ? `?q=${encodeURIComponent(query)}` : ''}`}
        className="inline-flex items-center gap-2 bg-warm-white text-terracotta text-sm font-body font-semibold px-5 py-2.5 rounded-full hover:bg-cream transition-colors duration-200"
      >
        See {matchCount === 1 ? 'match' : 'matches'} →
      </Link>
    </div>
  )
}
