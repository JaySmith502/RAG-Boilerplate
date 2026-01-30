import { Badge } from '@/components/ui/badge'
import type { IngestionStatus } from '@/types/api'

interface JobStatusBadgeProps {
  status: IngestionStatus
}

/**
 * Colored status badge for ingestion job status.
 * Maps statuses to appropriate badge variants and labels.
 */
export function JobStatusBadge({ status }: JobStatusBadgeProps) {
  switch (status) {
    case 'pending':
      return <Badge variant="outline">Pending</Badge>
    case 'processing':
      return <Badge variant="default">Running</Badge>
    case 'chunking':
      return <Badge variant="default">Chunking</Badge>
    case 'indexing':
      return <Badge variant="default">Indexing</Badge>
    case 'completed':
      return (
        <Badge
          variant="secondary"
          className="bg-green-500 hover:bg-green-500/80 text-white"
        >
          Complete
        </Badge>
      )
    case 'failed':
      return <Badge variant="destructive">Failed</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}
