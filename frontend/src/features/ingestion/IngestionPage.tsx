import { useState } from 'react'
import { CheckCircle, RefreshCw } from 'lucide-react'
import { PageContainer } from '@/components/layout/page-container'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IngestionForm } from './components/IngestionForm'
import { useStartJob } from './hooks/useStartJob'
import type { IngestionJobRequest } from '@/types/api'

export function IngestionPage() {
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)

  const {
    mutate: startJob,
    isPending,
    isError,
    error,
    reset,
  } = useStartJob()

  const handleSubmit = (request: IngestionJobRequest) => {
    reset() // Clear previous error
    setCurrentJobId(null) // Clear previous job ID
    startJob(request, {
      onSuccess: (data) => {
        setCurrentJobId(data.job_id)
      },
    })
  }

  const handleRetry = () => {
    reset()
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold">Ingestion</h2>
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

            {/* Job Started Success */}
            {currentJobId && !isPending && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-emerald-500/10 border border-emerald-500/50">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm">
                  Job started:{' '}
                  <code className="font-mono text-sm bg-muted px-1 py-0.5 rounded">
                    {currentJobId}
                  </code>
                </span>
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
      </div>
    </PageContainer>
  )
}
