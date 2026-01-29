import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { Session } from '@/types/api'

export function useSession(sessionId: string | null) {
  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => apiClient<Session>(`/sessions/${sessionId}`),
    enabled: !!sessionId,
    placeholderData: keepPreviousData,
  })
}
