import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { IngestionJobRequest, IngestionJobResponse } from '@/types/api'

export function useStartJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: IngestionJobRequest) => {
      return apiClient<IngestionJobResponse>('/ingestion/start_job', {
        method: 'POST',
        body: request,
      })
    },
    onSuccess: () => {
      // Invalidate ingestion jobs query to refresh job list
      queryClient.invalidateQueries({ queryKey: ['ingestion', 'jobs'] })
    },
  })
}
