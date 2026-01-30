import { useState, useRef, useEffect } from 'react'
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { PageContainer } from '@/components/layout/page-container'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IngestionForm } from './components/IngestionForm'
import { JobProgress } from './components/JobProgress'
import { JobStatusBadge } from './components/JobStatusBadge'
import { JobHistoryTable } from './components/JobHistoryTable'
import { JobHistorySkeleton } from './components/JobHistorySkeleton'
import { useStartJob } from './hooks/useStartJob'
import { useJobStatus } from './hooks/useJobStatus'
import { useActiveJobs } from './hooks/useActiveJobs'
import type { IngestionJobRequest, IngestionStatus } from '@/types/api'

export function IngestionPage() {
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const prevStatusRef = useRef<IngestionStatus | undefined>(undefined)

  const {
    mutate: startJob,
    isPending,
    isError,
    error,
    reset,
  } = useStartJob()

  const { data: progress } = useJobStatus(currentJobId)
  const { data: jobs, isPending: jobsLoading } = useActiveJobs()

  // Toast notifications on status transitions
  useEffect(() => {
    if (!progress) return

    const currentStatus = progress.status
    const prevStatus = prevStatusRef.current

    // Only fire toast on TRANSITION (not initial load)
    if (prevStatus !== undefined && prevStatus !== currentStatus) {
      if (currentStatus === 'completed') {
        toast.success('Ingestion Complete', {
          description: `Successfully processed ${progress.processed_documents ?? 0} files`,
        })
      } else if (currentStatus === 'failed') {
        toast.error('Ingestion Failed', {
          description: progress.error_message ?? 'Unknown error',
        })
      }
    }

    prevStatusRef.current = currentStatus
  }, [progress])

  const handleSubmit = (request: IngestionJobRequest) => {
    reset() // Clear previous error
    setCurrentJobId(null) // Clear previous job ID
    prevStatusRef.current = undefined // Reset status tracking
    startJob(request, {
      onSuccess: (data) => {
        setCurrentJobId(data.job_id)
      },
    })
  }

  const handleRetry = () => {
    reset()
  }

  const handleRetryJob = (_jobId: string) => {
    // Backend doesn't return original config, so inform user to configure a new job
    toast.info('Retry Job', {
      description: 'Please configure and start a new job with the same settings.',
    })
  }

  // Determine if job is in a running state
  const isRunning = progress &&
    ['pending', 'processing', 'chunking', 'indexing'].includes(progress.status)

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold">Ingestion</h2>
          <p className="text-muted-foreground">
            Ingest documents into the system
          </p>
        </div>

        {/* Ingestion Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Start Ingestion Job</CardTitle>
            <CardDescription>
              Select a folder and configure ingestion options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <IngestionForm
              onSubmit={handleSubmit}
              isPending={isPending}
            />

            {/* Job Status Section */}
            {currentJobId && !isPending && (
              <div className="space-y-4">
                {/* Job ID with Status Badge */}
                <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50 border">
                  <span className="text-sm">
                    Job:{' '}
                    <code className="font-mono text-sm bg-muted px-1 py-0.5 rounded">
                      {currentJobId}
                    </code>
                  </span>
                  {progress && <JobStatusBadge status={progress.status} />}
                </div>

                {/* Progress Display */}
                {progress && (
                  <>
                    {/* Completed State */}
                    {progress.status === 'completed' && (
                      <div className="flex items-center gap-2 p-3 rounded-md bg-green-500/10 border border-green-500/50">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <span className="text-sm text-green-700 dark:text-green-300">
                          Completed - processed {progress.processed_documents ?? 0} files
                        </span>
                      </div>
                    )}

                    {/* Failed State */}
                    {progress.status === 'failed' && (
                      <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/50">
                        <XCircle className="h-5 w-5 text-destructive" />
                        <span className="text-sm text-destructive">
                          Failed: {progress.error_message ?? 'Unknown error'}
                        </span>
                      </div>
                    )}

                    {/* Running State - Show Progress Bar */}
                    {isRunning && <JobProgress progress={progress} />}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error State */}
        {isError && (
          <div className="border border-destructive/50 bg-destructive/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-destructive">
                Failed to start job: {error instanceof Error ? error.message : 'Unknown error'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="border-destructive/50 text-destructive hover:bg-destructive/10"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Job History Card */}
        <Card>
          <CardHeader>
            <CardTitle>Job History</CardTitle>
          </CardHeader>
          <CardContent>
            {jobsLoading ? (
              <JobHistorySkeleton />
            ) : (
              <JobHistoryTable
                jobs={jobs ?? []}
                onRetry={handleRetryJob}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
