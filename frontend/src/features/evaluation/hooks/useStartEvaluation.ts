import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { EvaluationRequest, EvaluationStartResponse } from '@/types/api'

export function useStartEvaluation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: EvaluationRequest) => {
      return apiClient<EvaluationStartResponse>('/evaluation/start', {
        method: 'POST',
        body: request,
      })
    },
    onSuccess: () => {
      // Invalidate evaluations query to refresh list
      queryClient.invalidateQueries({ queryKey: ['evaluations'] })
    },
  })
}
