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
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StudentDataProvider>{children}</StudentDataProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
