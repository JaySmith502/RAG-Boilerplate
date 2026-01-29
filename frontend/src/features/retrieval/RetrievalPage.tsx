import { useRef } from 'react'
import { Search, RefreshCw } from 'lucide-react'
import { PageContainer } from '@/components/layout/page-container'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RetrievalForm } from './components/RetrievalForm'
import { ResultsTable } from './components/ResultsTable'
import { ResultsSkeleton } from './components/ResultsSkeleton'
import { useRetrieve } from './hooks/useRetrieve'
import type { RetrievalRequest } from '@/types/api'

export function RetrievalPage() {
  const lastRequestRef = useRef<RetrievalRequest | null>(null)

  const {
    mutate: retrieve,
    data,
    isPending,
    isError,
    error,
    reset,
  } = useRetrieve()

  const handleSubmit = (request: RetrievalRequest) => {
    lastRequestRef.current = request
    reset() // Clear previous error
    retrieve(request)
  }

  const handleRetry = () => {
    if (lastRequestRef.current) {
      reset()
      retrieve(lastRequestRef.current)
    }
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold">Retrieval Testing</h2>
          <p className="text-muted-foreground">
            Test retrieval queries with different parameters and inspect results
          </p>
        </div>

        {/* Query Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Query Parameters</CardTitle>
            <CardDescription>
              Configure your search query and retrieval options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RetrievalForm
              onSubmit={handleSubmit}
              isPending={isPending}
            />
          </CardContent>
        </Card>

        {/* Error State */}
        {isError && (
          <div className="border border-destructive/50 bg-destructive/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-destructive">
                Failed to retrieve: {error instanceof Error ? error.message : 'Unknown error'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="border-destructive/50 text-destructive hover:bg-destructive/10"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isPending && <ResultsSkeleton rows={5} />}

        {/* Results */}
        {data && !isPending && (
          data.documents.length > 0 ? (
            <ResultsTable
              documents={data.documents}
              query={data.query}
              totalRetrieved={data.total_retrieved}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No results found</p>
              <p className="text-sm">Try adjusting your query or parameters</p>
            </div>
          )
        )}
      </div>
    </PageContainer>
  )
}
