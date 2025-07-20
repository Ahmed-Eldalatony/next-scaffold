'use client'
import { QueryClient } from '@tanstack/react-query'
import { isServer } from '@tanstack/react-query'

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60_000 }, // Prevents immediate refetch after hydration
    },
  })
}

let browserClient: QueryClient | undefined

export function getQueryClient() {
  if (isServer) {
    return createQueryClient() // New for each SSR request
  }
  if (!browserClient) {
    browserClient = createQueryClient() // Singleton in browser
  }
  return browserClient
}


