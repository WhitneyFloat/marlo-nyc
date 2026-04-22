import { cn } from '@/lib/utils'

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-parchment',
        className
      )}
    />
  )
}

export function ProgramCardSkeleton() {
  return (
    <div className="bg-warm-white rounded-2xl overflow-hidden">
      <div className="h-1 bg-parchment" />
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="w-14 h-14 rounded-xl flex-shrink-0" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function MatchBannerSkeleton() {
  return (
    <div className="rounded-2xl p-6 bg-parchment animate-pulse">
      <Skeleton className="h-3 w-24 mb-3 bg-stone-pale" />
      <Skeleton className="h-7 w-full mb-2 bg-stone-pale" />
      <Skeleton className="h-7 w-3/4 mb-4 bg-stone-pale" />
      <Skeleton className="h-9 w-32 rounded-full bg-stone-pale" />
    </div>
  )
}

export function HomeFeedSkeleton() {
  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      <MatchBannerSkeleton />
      <div className="space-y-3">
        <Skeleton className="h-5 w-48" />
        <ProgramCardSkeleton />
        <ProgramCardSkeleton />
        <ProgramCardSkeleton />
      </div>
    </div>
  )
}
