import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getAccessToken, setAccessToken } from '@/lib/api'
import type { UserProfile } from '@/lib/apiTypes'
import { getHomeHashForBackendRole } from '@/routes/roleRoutes'
import { authApi, type AuthResult, type LoginInput, type RegisterInput } from './auth.api'
import {
  clearStoredBootstrap,
  hydrateBootstrapCache,
  readStoredBootstrap,
  writeStoredBootstrap,
} from './bootstrapCache'

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
  const queryClient = useQueryClient()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isRestoring, setIsRestoring] = useState(Boolean(getAccessToken()))

  useEffect(() => {
    const restore = async () => {
      const token = getAccessToken()
      if (!token) {
        setIsRestoring(false)
        return
      }
      const cachedBootstrap = readStoredBootstrap(token)
      if (cachedBootstrap) {
        hydrateBootstrapCache(queryClient, cachedBootstrap)
        setUser(cachedBootstrap.user)
        setIsRestoring(false)
      }
      try {
        const bootstrap = await authApi.bootstrap()
        hydrateBootstrapCache(queryClient, bootstrap)
        writeStoredBootstrap(token, bootstrap)
        setUser(bootstrap.user)
      } catch {
        setAccessToken(null)
        clearStoredBootstrap()
        queryClient.clear()
      } finally {
        setIsRestoring(false)
      }
    }

    const unauthorized = () => {
      setUser(null)
      clearStoredBootstrap()
      queryClient.clear()
      if (!['#login', '#register'].includes(window.location.hash)) window.location.hash = '#login'
    }

    window.addEventListener('cares:unauthorized', unauthorized)
    void restore()
    return () => window.removeEventListener('cares:unauthorized', unauthorized)
  }, [queryClient])

  const authenticate = useCallback(
    async (action: () => Promise<AuthResult>) => {
      const result = await action()
      setAccessToken(result.accessToken)
      hydrateBootstrapCache(queryClient, result.bootstrap)
      writeStoredBootstrap(result.accessToken, result.bootstrap)
      const nextUser = result.bootstrap?.user ?? result.user
      setUser(nextUser)
      window.location.hash = getHomeHashForBackendRole(nextUser.role)
    },
    [queryClient],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isRestoring,
      login: (input) => authenticate(() => authApi.login(input)),
      register: (input) => authenticate(() => authApi.register(input)),
      logout: () => {
        setAccessToken(null)
        clearStoredBootstrap()
        setUser(null)
        queryClient.clear()
        window.location.hash = '#login'
      },
      updateProfile: async (input) => setUser(await authApi.updateProfile(input)),
    }),
    [authenticate, isRestoring, queryClient, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
