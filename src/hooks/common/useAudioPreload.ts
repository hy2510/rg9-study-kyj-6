import { useEffect, useRef } from 'react'

/**
 * 사운드 URL 배열을 백그라운드에서 프리로드하여 브라우저 HTTP 캐시를 미리 채워둔다.
 * 기존 재생 로직(new Audio(url))은 그대로 유지되며, 캐시 히트로 즉시 재생됨.
 * 프리로드 실패는 무시(fire-and-forget)하며 기존 로직이 fallback 역할을 한다.
 * @param urls 프리로드할 오디오 URL 배열
 */
export default function useAudioPreload(urls: string[]) {
  const cacheRef = useRef<Map<string, HTMLAudioElement>>(new Map())

  useEffect(() => {
    if (!urls.length) return

    const cache = cacheRef.current
    urls.forEach((url) => {
      if (!url || cache.has(url)) return
      const audio = new Audio()
      audio.preload = 'auto'
      audio.src = url
      try {
        audio.load()
      } catch {
        // ignore load errors — 재생 시점의 fallback 이 처리
      }
      cache.set(url, audio)
    })
  }, [urls.join(',')])
}
