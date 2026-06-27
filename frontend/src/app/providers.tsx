import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'
import { StudentDataProvider } from '@/features/student/context/StudentDataContext'
import { AuthProvider } from '@/features/auth/AuthContext'

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  queryClient.setQueryDefaults(['directory'], {
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
  })
  queryClient.setQueryDefaults(['notifications'], {
    staleTime: 20_000,
    gcTime: 5 * 60_000,
  })

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StudentDataProvider>{children}</StudentDataProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
