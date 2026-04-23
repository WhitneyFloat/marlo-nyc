'use client'

import Link from 'next/link'

interface MatchBannerProps {
  childName:  string
  matchCount: number
  query?:     string
}

export function MatchBanner({ childName, matchCount, query }: MatchBannerProps) {
  return (
    <div
      className="rounded-2xl p-6 animate-fade-in"
      style={{ background: 'linear-gradient(135deg, #C4603A 0%, #E8896A 100%)' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-xs uppercase tracking-widest font-body px-2.5 py-0.5 rounded-full"
          style={{ background: '#6B9E7040', color: '#D4EAD6' }}
        >
          Marlo&apos;s picks
        </span>
      </div>
      <h2
        className="text-warm-white text-2xl leading-tight mb-4"
        style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
      >
        {matchCount} {matchCount === 1 ? 'match' : 'matches'} found for {childName} this week.
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
