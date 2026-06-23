import { useEffect, useState } from 'react'
import type { AuthMode } from '../types'

function resolveAuthModeFromLocation(): AuthMode {
  const path = window.location.pathname.toLowerCase()
  const hash = window.location.hash.toLowerCase()

  return path.includes('register') || hash.includes('register') ? 'register' : 'login'
}

export function useAuthMode() {
  const [mode, setMode] = useState<AuthMode>(resolveAuthModeFromLocation)

  useEffect(() => {
    const syncModeWithLocation = () => {
      setMode(resolveAuthModeFromLocation())
    }

    window.addEventListener('hashchange', syncModeWithLocation)
    window.addEventListener('popstate', syncModeWithLocation)

    return () => {
      window.removeEventListener('hashchange', syncModeWithLocation)
      window.removeEventListener('popstate', syncModeWithLocation)
    }
  }, [])

  const setAuthMode = (nextMode: AuthMode) => {
    setMode(nextMode)
    window.history.pushState(null, '', nextMode === 'register' ? '#register' : '#login')
  }

  return { mode, setAuthMode }
}
