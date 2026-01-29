import { QueryClient } from '@tanstack/react-query'

/**
 * Global QueryClient configuration.
 *
 * Settings:
 * - staleTime: 1 minute - data considered fresh for 1 min before background refetch
 * - gcTime: 5 minutes - unused cached data kept for 5 min (formerly cacheTime)
 * - retry: 1 - retry failed requests once
 * - refetchOnWindowFocus: false - don't refetch when user returns to tab
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0, // Don't retry mutations by default
    },
  },
})
