import { useEvaluation } from '../hooks/useEvaluation'
import { EvaluationsSkeleton } from './EvaluationsSkeleton'

interface ResultsDisplayProps {
  evaluationId: string
}

/**
 * Internal component for metric cards.
 */
function MetricCard({
  label,
  value,
  format,
}: {
  label: string
  value: number | undefined
  format: 'percent' | 'decimal'
}) {
  const displayValue =
    value !== undefined
      ? format === 'percent'
        ? `${(value * 100).toFixed(1)}%`
        : value.toFixed(3)
      : 'N/A'

  return (
    <div className="rounded-xl border p-4 text-center bg-card shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{displayValue}</p>
    </div>
  )
}

/**
 * Displays evaluation results: metrics cards and configuration used.
 * Fetches evaluation details via useEvaluation hook.
 */
export function ResultsDisplay({ evaluationId }: ResultsDisplayProps) {
  const { data, isPending, isError, error } = useEvaluation(evaluationId)

  if (isPending) {
    return <EvaluationsSkeleton />
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive p-4 text-destructive">
        {error instanceof Error ? error.message : 'Failed to load evaluation'}
      </div>
    )
  }

  if (!data) {
    return null
  }

  const { results_summary, retrieve_params } = data
  const topK = retrieve_params?.top_k as number | undefined
  const useQueryEnhancer = retrieve_params?.use_query_enhancer as boolean | undefined
  const useReranking = retrieve_params?.use_reranking as boolean | undefined

  return (
    <div className="space-y-4">
      {/* Metrics grid - EVAL-10 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="Hit Rate"
          value={results_summary?.hit_rate}
          format="percent"
        />
        <MetricCard
          label="MRR"
          value={results_summary?.mrr}
          format="decimal"
        />
        <MetricCard
          label="Avg Score"
          value={results_summary?.avg_score}
          format="decimal"
        />
      </div>

      {/* Configuration section - EVAL-11 */}
      <div className="rounded-lg bg-muted p-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Top-K:</span>{' '}
            <span className="font-medium">{topK ?? 'N/A'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Query Enhancer:</span>{' '}
            <span className="font-medium">{useQueryEnhancer ? 'Yes' : 'No'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Reranking:</span>{' '}
            <span className="font-medium">{useReranking ? 'Yes' : 'No'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Questions:</span>{' '}
            <span className="font-medium">{results_summary?.total_questions ?? 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
