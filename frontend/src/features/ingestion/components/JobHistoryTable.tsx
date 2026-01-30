import { useState } from 'react'
import { ChevronDown, RotateCcw, XCircle, CheckCircle } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
} from '@/components/ui/collapsible'
import { JobStatusBadge } from './JobStatusBadge'
import { JobProgress } from './JobProgress'
import { cn } from '@/lib/utils'
import type { TaskProgress, IngestionJobRequest } from '@/types/api'

interface JobHistoryTableProps {
  jobs: TaskProgress[]
  onRetry?: (jobId: string, originalConfig?: IngestionJobRequest) => void
}

function JobRow({
  job,
  onRetry,
}: {
  job: TaskProgress
  onRetry?: (jobId: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const hasFailed = job.status === 'failed'
  const isComplete = job.status === 'completed'
  const isRunning = ['pending', 'processing', 'chunking', 'indexing'].includes(job.status)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} asChild>
      <>
        <TableRow
          className={cn(
            hasFailed && 'cursor-pointer hover:bg-muted/50',
            isComplete && 'bg-green-50/50 dark:bg-green-950/20'
          )}
          onClick={() => hasFailed && setIsOpen(!isOpen)}
        >
          <TableCell className="font-mono text-xs">
            {job.job_id.slice(0, 8)}...
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <JobStatusBadge status={job.status} />
              {isComplete && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </div>
          </TableCell>
          <TableCell>
            {isRunning && job.progress_percentage !== undefined ? (
              <JobProgress progress={job} compact />
            ) : isComplete ? (
              <span className="text-sm">
                {job.successful_documents ?? job.processed_documents ?? 0}/
                {job.total_documents ?? 0} files
              </span>
            ) : hasFailed ? (
              <span className="text-sm text-destructive">Click for details</span>
            ) : null}
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              {hasFailed && onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRetry(job.job_id)
                  }}
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              )}
              {hasFailed && (
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform',
                    isOpen && 'rotate-180'
                  )}
                />
              )}
            </div>
          </TableCell>
        </TableRow>
        {hasFailed && (
          <CollapsibleContent asChild>
            <TableRow>
              <TableCell
                colSpan={4}
                className="bg-destructive/10 border-destructive/20"
              >
                <div className="flex items-start gap-2 p-2">
                  <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-destructive">
                      Error Details
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {job.error_message ?? 'Unknown error'}
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </CollapsibleContent>
        )}
      </>
    </Collapsible>
  )
}

export function JobHistoryTable({ jobs, onRetry }: JobHistoryTableProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No ingestion jobs yet. Start one above!
      </div>
    )
  }

  return (
    <div className="border rounded-lg shadow-sm overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <JobRow key={job.job_id} job={job} onRetry={onRetry} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
