import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { ChatRequest, ChatResponse } from '@/types/api'

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: ChatRequest) => {
      return apiClient<ChatResponse>('/chat', {
        method: 'POST',
        body: request,
      })
    },
    onSuccess: (data) => {
      // Invalidate session to refetch with new messages
      queryClient.invalidateQueries({
        queryKey: ['session', data.session_id]
      })
      // Invalidate sessions list for updated timestamps
      queryClient.invalidateQueries({
        queryKey: ['sessions']
      })
    },
  })
}
