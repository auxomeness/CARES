import { useEffect, useState } from 'react'
import { defaultRoute, getRouteByHash } from '@/routes/routes'

function getActiveHash() {
  return window.location.hash || defaultRoute.hash
}

export function AppRouter() {
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

  return activeRoute.element
}
