import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import { getAccessToken, setAccessToken } from '@/lib/api'
import type { UserProfile } from '@/lib/apiTypes'
import { getHomeHashForBackendRole } from '@/routes/roleRoutes'
import { authApi, type LoginInput, type RegisterInput } from './auth.api'

type AuthContextValue = {
  user: UserProfile | null
  isRestoring: boolean
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => void
  updateProfile: (input: Partial<RegisterInput>) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isRestoring, setIsRestoring] = useState(Boolean(getAccessToken()))

  useEffect(() => {
    const restore = async () => {
      if (!getAccessToken()) {
        setIsRestoring(false)
        return
      }
      try {
        setUser(await authApi.me())
      } catch {
        setAccessToken(null)
      } finally {
        setIsRestoring(false)
      }
    }

    const unauthorized = () => {
      setUser(null)
      if (!['#login', '#register'].includes(window.location.hash)) window.location.hash = '#login'
    }

    window.addEventListener('cares:unauthorized', unauthorized)
    void restore()
    return () => window.removeEventListener('cares:unauthorized', unauthorized)
  }, [])

  const authenticate = async (action: () => Promise<{ accessToken: string; user: UserProfile }>) => {
    const result = await action()
    setAccessToken(result.accessToken)
    setUser(result.user)
    window.location.hash = getHomeHashForBackendRole(result.user.role)
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isRestoring,
      login: (input) => authenticate(() => authApi.login(input)),
      register: (input) => authenticate(() => authApi.register(input)),
      logout: () => {
        setAccessToken(null)
        setUser(null)
        window.location.hash = '#login'
      },
      updateProfile: async (input) => setUser(await authApi.updateProfile(input)),
    }),
    [isRestoring, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
