import { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { PageContainer } from '@/components/layout/page-container'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EvaluationForm } from './components/EvaluationForm'
import { useStartEvaluation } from './hooks/useStartEvaluation'
import { useEvaluations } from './hooks/useEvaluations'
import type { EvaluationRequest } from '@/types/api'

export function EvaluationPage() {
  const [lastEvaluationId, setLastEvaluationId] = useState<string | null>(null)

  const { mutate: startEvaluation, isPending, isError, error, reset } = useStartEvaluation()
  const { data: evaluationsData } = useEvaluations()
  const evaluations = evaluationsData?.evaluations ?? []

  const handleSubmit = (request: EvaluationRequest) => {
    reset()
    setLastEvaluationId(null)
    startEvaluation(request, {
      onSuccess: (data) => {
        setLastEvaluationId(data.evaluation_id)
        toast.success('Evaluation Complete', {
          description: `Evaluation ${data.evaluation_id.slice(0, 8)}... finished`,
        })
      },
    })
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold">Evaluation</h2>
          <p className="text-muted-foreground">
            Test retrieval system performance
          </p>
        </div>

        {/* Evaluation Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Start Evaluation</CardTitle>
            <CardDescription>
              Configure and run a retrieval evaluation on your document collection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EvaluationForm
              onSubmit={handleSubmit}
              isPending={isPending}
              evaluations={evaluations}
            />
          </CardContent>
        </Card>

        {/* Evaluation Result - EVAL-08 */}
        {lastEvaluationId && (
          <Card className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100">
                    Evaluation complete
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Evaluation ID:{' '}
                    <code className="font-mono bg-green-100 dark:bg-green-900/50 px-1 rounded">
                      {lastEvaluationId}
                    </code>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {isError && (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-destructive">
                    Evaluation failed
                  </p>
                  <p className="text-sm text-destructive/80">
                    {error instanceof Error ? error.message : 'An unexpected error occurred'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={reset}
                >
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  )
}
