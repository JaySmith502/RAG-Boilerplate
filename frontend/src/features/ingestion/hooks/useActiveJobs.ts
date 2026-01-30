import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { TaskProgress } from '@/types/api'

/**
 * Hook for fetching the list of active/recent ingestion jobs.
 * Polls every 10 seconds to keep the job history table updated.
 * Jobs have 1 hour TTL in Redis, so this shows recent active jobs.
 */
export function useActiveJobs() {
  return useQuery({
    queryKey: ['ingestion', 'jobs'],
    queryFn: () => apiClient<TaskProgress[]>('/ingestion/jobs'),
    refetchInterval: 10000, // 10 second polling for job list
  })
}
