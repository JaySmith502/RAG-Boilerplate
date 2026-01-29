import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { RetrievalRequest, RetrievalResponse } from '@/types/api'

export function useRetrieve() {
  return useMutation({
    mutationFn: async (request: RetrievalRequest) => {
      return apiClient<RetrievalResponse>('/retrieve', {
        method: 'POST',
        body: request,
      })
    },
  })
}
