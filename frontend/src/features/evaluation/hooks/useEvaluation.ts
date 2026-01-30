import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { EvaluationStatusResponse } from '@/types/api'

export function useEvaluation(evaluationId: string | null) {
  return useQuery({
    queryKey: ['evaluation', evaluationId],
    queryFn: () => apiClient<EvaluationStatusResponse>(`/evaluation/${evaluationId}`),
    enabled: !!evaluationId,
  })
}
