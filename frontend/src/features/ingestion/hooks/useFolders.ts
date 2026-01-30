import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { AssetsListResponse } from '@/types/api'

export function useFolders() {
  return useQuery({
    queryKey: ['assets', 'folders'],
    queryFn: () => apiClient<AssetsListResponse>('/assets/list'),
  })
}
