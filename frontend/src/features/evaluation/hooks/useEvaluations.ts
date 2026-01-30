import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { EvaluationsListResponse } from '@/types/api'

export function useEvaluations(limit: number = 50) {
  return useQuery({
    queryKey: ['evaluations', limit],
    queryFn: () => apiClient<EvaluationsListResponse>(`/evaluations?limit=${limit}`),
  })
}
