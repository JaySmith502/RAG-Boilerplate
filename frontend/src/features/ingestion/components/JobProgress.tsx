import { Progress } from '@/components/ui/progress'
import type { TaskProgress } from '@/types/api'

interface JobProgressProps {
  progress: TaskProgress
  /** Compact mode for table row display - shows only percentage and bar */
  compact?: boolean
}

/**
 * Progress bar with stats for ingestion job.
 * Shows percentage, file count, and current file being processed.
 */
export function JobProgress({ progress, compact = false }: JobProgressProps) {
  const percentage = progress.progress_percentage ?? 0
  const processed = progress.processed_documents ?? 0
  const total = progress.total_documents ?? 0

  if (compact) {
    return (
      <div className="space-y-1 min-w-32">
        <div className="text-sm font-medium">{percentage}%</div>
        <Progress value={percentage} className="h-1.5" />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Top row: percentage and file count */}
      <div className="flex justify-between text-sm">
        <span className="font-medium">{percentage}%</span>
        <span className="text-muted-foreground">
          {processed}/{total} files
        </span>
      </div>

      {/* Progress bar */}
      <Progress value={percentage} />

      {/* Current file being processed */}
      {progress.current_file && (
        <p className="text-sm text-muted-foreground truncate">
          Processing: {progress.current_file}
        </p>
      )}
    </div>
  )
}
