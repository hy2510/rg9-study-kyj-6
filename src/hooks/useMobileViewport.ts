import { useEffect, useState } from 'react'

import { BREAKPOINT_MOBILE_MAX } from '@styles/tokens/breakpoints'

const MOBILE_VIEWPORT_QUERY = `(max-width: ${BREAKPOINT_MOBILE_MAX}px)`

/** SSR에서는 false로 시작하고 클라이언트의 공통 mobile breakpoint을 추적한다. */
export function useMobileViewport() {
  const [isMobileViewport, setIsMobileViewport] = useState(false)

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    )
      return undefined

    const mediaQuery = window.matchMedia(MOBILE_VIEWPORT_QUERY)
    const syncViewport = () => setIsMobileViewport(mediaQuery.matches)
    syncViewport()

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncViewport)
      return () => mediaQuery.removeEventListener('change', syncViewport)
    }

    if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(syncViewport)
      return () => mediaQuery.removeListener(syncViewport)
    }

    return undefined
  }, [])

  return isMobileViewport
}
