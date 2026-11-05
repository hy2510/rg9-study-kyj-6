import { useEffect, useState } from 'react'

import { DESKTOP_STORY_CHROME_MEDIA } from '@hooks/story/useDesktopStoryChrome'

/**
 * 비데스크톱 스토리(터치 중심 기기)에서 **세로(portrait)** 일 때 true.
 * 스토리는 한 스프레드 안에서도 한 장씩 보이도록 쓴다.
 */
export function useMobileStoryPortrait(): boolean {
  const [active, setActive] = useState(false)

  useEffect(() => {
    const mqDesk = window.matchMedia(DESKTOP_STORY_CHROME_MEDIA)
    const sync = () => {
      const portrait = window.innerHeight > window.innerWidth
      setActive(portrait && !mqDesk.matches)
    }
    sync()
    mqDesk.addEventListener('change', sync)
    window.addEventListener('resize', sync)
    window.addEventListener('orientationchange', sync)
    return () => {
      mqDesk.removeEventListener('change', sync)
      window.removeEventListener('resize', sync)
      window.removeEventListener('orientationchange', sync)
    }
  }, [])

  return active
}
