import { useEffect, useState } from 'react'
import { defaultRoute, getRouteByHash } from '@/routes/routes'
import { useAuth } from '@/features/auth/AuthContext'
import { getHomeHashForBackendRole } from '@/routes/roleRoutes'

function getActiveHash() {
  return window.location.hash || defaultRoute.hash
}

export function AppRouter() {
  const { user, isRestoring } = useAuth()
  const [activeHash, setActiveHash] = useState(getActiveHash)
  const activeRoute = getRouteByHash(activeHash)

  useEffect(() => {
    const syncActiveHash = () => {
      setActiveHash(getActiveHash())
    }

    window.addEventListener('hashchange', syncActiveHash)
    window.addEventListener('popstate', syncActiveHash)

    return () => {
      window.removeEventListener('hashchange', syncActiveHash)
      window.removeEventListener('popstate', syncActiveHash)
    }
  }, [])

  useEffect(() => {
    if (isRestoring) return
    const isAuthRoute = activeRoute.id === 'login' || activeRoute.id === 'register'

    if (!user && !isAuthRoute) {
      window.location.hash = '#login'
      return
    }

    if (user && isAuthRoute) {
      window.location.hash = getHomeHashForBackendRole(user.role)
      return
    }

    if (user && !isAuthRoute) {
      const expectedPrefix = getHomeHashForBackendRole(user.role)
      if (!activeRoute.hash.startsWith(expectedPrefix)) {
        window.location.hash = expectedPrefix
      }
    }
  }, [activeRoute.hash, activeRoute.id, isRestoring, user])

  if (isRestoring) {
    return (
      <main className="grid min-h-svh place-items-center bg-[#f2f2f2] text-[#1b3a6b]">
        <p className="text-sm font-semibold">Restoring CARES session...</p>
      </main>
    )
  }

  return activeRoute.element
}
