import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { SessionsListResponse } from '@/types/api'

export function useSessions() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: () => apiClient<SessionsListResponse>('/sessions'),
  })
}
