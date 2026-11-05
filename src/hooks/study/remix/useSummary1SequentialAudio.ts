import { useCallback, useEffect, useRef, useState } from 'react'

import { useStudyVisibility } from '@contexts/StudyVisibilityContext'

/**
 * Summary1 완료 화면: 문장 순서대로 음원을 연속 재생하고,
 * 현재 재생 중인 문장 인덱스(0-based)를 반환합니다.
 */
export function useSummary1SequentialAudio(soundUrls: string[]) {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const urlsRef = useRef(soundUrls)
  const isStudyVisible = useStudyVisibility()

  /** 재귀 시 클로저/선언 순서 이슈 없이 최신 playFromIndex 호출 */
  const playFromIndexRef = useRef<(index: number) => void>(() => {})

  useEffect(() => {
    urlsRef.current = soundUrls
  }, [soundUrls])

  const stopInternal = useCallback(() => {
    const a = audioRef.current
    if (a) {
      a.pause()
      a.src = ''
      a.removeAttribute('src')
      a.load()
    }
    audioRef.current = null
    setIsPlaying(false)
    setPlayingIndex(null)
  }, [])

  const playAtIndex = useCallback(
    (index: number, options: { chain: boolean }) => {
      const prev = audioRef.current
      if (prev) {
        prev.pause()
        prev.src = ''
        prev.removeAttribute('src')
      }
      audioRef.current = null

      const urls = urlsRef.current
      let i = index
      while (i < urls.length && !urls[i]?.trim()) {
        if (!options.chain) {
          stopInternal()
          return
        }
        i += 1
      }
      if (i >= urls.length) {
        stopInternal()
        return
      }

      const url = urls[i]
      const audio = new Audio(url)
      audioRef.current = audio

      const onEnded = () => {
        if (audioRef.current !== audio) return
        audio.removeEventListener('ended', onEnded)
        audio.removeEventListener('error', onError)
        if (options.chain) {
          playFromIndexRef.current(i + 1)
        } else {
          stopInternal()
        }
      }
      const onError = () => {
        if (audioRef.current !== audio) return
        audio.removeEventListener('ended', onEnded)
        audio.removeEventListener('error', onError)
        if (options.chain) {
          playFromIndexRef.current(i + 1)
        } else {
          stopInternal()
        }
      }

      audio.addEventListener('ended', onEnded)
      audio.addEventListener('error', onError)

      setPlayingIndex(i)
      setIsPlaying(true)

      audio.play().catch(() => {
        if (audioRef.current === audio) {
          audioRef.current = null
        }
        if (options.chain) {
          playFromIndexRef.current(i + 1)
        } else {
          stopInternal()
        }
      })
    },
    [stopInternal],
  )

  const playFromIndex = useCallback(
    (index: number) => playAtIndex(index, { chain: true }),
    [playAtIndex],
  )

  const playOne = useCallback(
    (index: number) => playAtIndex(index, { chain: false }),
    [playAtIndex],
  )

  useEffect(() => {
    playFromIndexRef.current = playFromIndex
  }, [playFromIndex])

  const toggle = useCallback(() => {
    if (isPlaying) {
      stopInternal()
      return
    }
    if (urlsRef.current.length === 0) return
    playFromIndex(0)
  }, [isPlaying, playFromIndex, stopInternal])

  useEffect(() => {
    if (isStudyVisible) return
    stopInternal()
  }, [isStudyVisible, stopInternal])

  useEffect(() => {
    return () => stopInternal()
  }, [stopInternal])

  return {
    /** 현재 읽고 있는 문장 인덱스(0~). 재생 중이 아니면 null */
    playingIndex,
    isPlaying,
    toggle,
    /** 해당 인덱스 문장만 1회 재생 (연속 재생하지 않음). 이미 재생 중이면 중단 후 시작. */
    playOne,
    stop: stopInternal,
  }
}
