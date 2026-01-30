import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { TaskProgress } from '@/types/api'

/**
 * Hook for polling job status with conditional refetch.
 * Polls every 5 seconds while job is running, stops when completed or failed.
 *
 * @param jobId - The job ID to poll status for, or null if no job
 * @returns Query result with TaskProgress data
 */
export function useJobStatus(jobId: string | null) {
  return useQuery({
    queryKey: ['ingestion', 'status', jobId],
    queryFn: async () => {
      return apiClient<TaskProgress>(`/ingestion/status/${jobId}`)
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false // Stop polling
      }
      return 5000 // 5 second polling per CONTEXT.md
    },
  })
}
