import { useEffect, useState } from 'react'

/** 이미지가 브라우저 캐시에 있어 즉시 표시 가능한지 동기적으로 판정 */
function isImageAlreadyCached(url: string): boolean {
  if (!url) return true
  const img = new Image()
  img.src = url
  return img.complete && img.naturalWidth > 0
}

/**
 * CSS background-image용 URL이 브라우저에서 디코드·표시 가능할 때까지 대기.
 * 캐시 히트 시엔 첫 렌더부터 ready=true 로 시작해 1프레임 흰 배경 플래시를 방지.
 */
export function useStoryPageBackgroundReady(imageSrc: string): boolean {
  const [ready, setReady] = useState(() => isImageAlreadyCached(imageSrc.trim()))

  useEffect(() => {
    const trimmed = imageSrc.trim()
    if (!trimmed) {
      setReady(true)
      return undefined
    }

    const img = new Image()
    img.src = trimmed
    if (img.complete && img.naturalWidth > 0) {
      setReady(true)
      return undefined
    }

    setReady(false)
    let cancelled = false
    const done = () => {
      if (!cancelled) setReady(true)
    }
    img.onload = done
    img.onerror = done

    return () => {
      cancelled = true
      img.onload = null
      img.onerror = null
    }
  }, [imageSrc])

  return ready
}
