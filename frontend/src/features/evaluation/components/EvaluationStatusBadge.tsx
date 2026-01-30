import { Badge } from '@/components/ui/badge'

interface EvaluationStatusBadgeProps {
  status: string
}

/**
 * Colored status badge for evaluation status.
 * Maps statuses to appropriate badge variants and labels.
 */
export function EvaluationStatusBadge({ status }: EvaluationStatusBadgeProps) {
  switch (status) {
    case 'pending':
      return <Badge variant="outline">Pending</Badge>
    case 'running':
      return <Badge variant="default">Running</Badge>
    case 'completed':
      return (
        <Badge
          variant="secondary"
          className="bg-green-500 hover:bg-green-500/80 text-white"
        >
          Completed
        </Badge>
      )
    case 'failed':
      return <Badge variant="destructive">Failed</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}
