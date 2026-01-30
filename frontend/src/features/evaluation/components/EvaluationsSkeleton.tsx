import { Skeleton } from '@/components/ui/skeleton'

/**
 * Loading skeleton for the results display.
 * Matches ResultsDisplay layout with 3 metric cards and config section.
 */
export function EvaluationsSkeleton() {
  return (
    <div className="space-y-4">
      {/* Metric cards grid */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      {/* Config section */}
      <Skeleton className="h-16 rounded-lg" />
    </div>
  )
}
