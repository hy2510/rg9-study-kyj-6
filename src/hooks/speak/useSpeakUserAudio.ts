import { useCallback, useEffect, useRef, useState } from 'react'

type UseSpeakUserAudioProps = {
  blob?: Blob
  onEnded?: () => void
}

/**
 * Speak 유저 녹음 재생 훅 (HTMLAudioElement 기반).
 *
 * - 모바일 OS 가 미디어 세션(playback) 으로 승격해 볼륨 키 → 미디어 볼륨으로 조절된다.
 * - `MediaRecorder` 가 생성한 WebM/Opus blob 의 `duration = Infinity` 버그는
 *   loadedmetadata 에서 끝까지 seek 하는 hack 으로 보정한다. (Chromium #642012)
 *
 * API 는 `useSpeakAudio` 와 거의 동형. 입력만 `soundPath: string` → `blob: Blob` 차이.
 */
export default function useSpeakUserAudio({
  blob,
  onEnded,
}: UseSpeakUserAudioProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const objectUrlRef = useRef<string | null>(null)
  const progressFrameRef = useRef<number | null>(null)
  const playRequestRef = useRef(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isAudioReady, setIsAudioReady] = useState(false)
  const [audioDuration, setAudioDuration] = useState(0)
  const [playbackProgress, setPlaybackProgress] = useState(0)
  const onEndedRef = useRef(onEnded)
  useEffect(() => {
    onEndedRef.current = onEnded
  })

  const clearProgressFrame = useCallback(() => {
    if (progressFrameRef.current !== null) {
      cancelAnimationFrame(progressFrameRef.current)
      progressFrameRef.current = null
    }
  }, [])

  useEffect(() => {
    setIsAudioReady(false)
    setAudioDuration(0)
    setPlaybackProgress(0)
    setIsPlaying(false)
    clearProgressFrame()

    if (!blob) return

    const url = URL.createObjectURL(blob)
    objectUrlRef.current = url

    const audio = new Audio()
    audio.preload = 'auto'

    // MediaRecorder 가 만든 WebM/Opus blob 은 duration 메타가 없어 Infinity 로 들어온다.
    // 끝까지 seek 하면 브라우저가 실제 길이를 계산해 durationchange 로 반영한다.
    const INFINITY_HACK_TIME = 1e101
    let infinityHackApplied = false

    const resolveReady = (duration: number) => {
      if (Number.isFinite(duration) && duration > 0) {
        setAudioDuration(duration)
      }
      setIsAudioReady(true)
    }

    const handleLoaded = () => {
      const duration = audio.duration
      if (!Number.isFinite(duration) || duration <= 0) {
        if (!infinityHackApplied) {
          infinityHackApplied = true
          try {
            audio.currentTime = INFINITY_HACK_TIME
          } catch {
            // seek 실패하면 duration 0 상태로 ready 처리
            resolveReady(0)
          }
          return
        }
      }
      resolveReady(duration)
    }

    const handleDurationChange = () => {
      const duration = audio.duration
      if (!Number.isFinite(duration) || duration <= 0) return
      try {
        audio.currentTime = 0
      } catch {
        // ignore
      }
      resolveReady(duration)
    }

    const handleEnded = () => {
      clearProgressFrame()
      setIsPlaying(false)
      setPlaybackProgress(1)
      onEndedRef.current?.()
    }
    const handleError = () => {
      // 로드 실패는 조용히 무시 — UI 는 재생 버튼 비활성 유지
      setIsAudioReady(false)
    }

    audio.addEventListener('loadedmetadata', handleLoaded)
    audio.addEventListener('durationchange', handleDurationChange)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    audio.src = url
    audio.load()
    audioRef.current = audio

    return () => {
      playRequestRef.current += 1
      clearProgressFrame()
      audio.removeEventListener('loadedmetadata', handleLoaded)
      audio.removeEventListener('durationchange', handleDurationChange)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      try {
        audio.pause()
      } catch {
        // ignore
      }
      audio.src = ''
      if (audioRef.current === audio) audioRef.current = null
      if (objectUrlRef.current === url) {
        URL.revokeObjectURL(url)
        objectUrlRef.current = null
      }
    }
  }, [blob, clearProgressFrame])

  const play = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    clearProgressFrame()
    const requestId = ++playRequestRef.current

    try {
      audio.currentTime = 0
    } catch {
      // seek 실패는 재생 자체에 치명적이지 않음
    }
    setPlaybackProgress(0)

    const tick = () => {
      if (requestId !== playRequestRef.current) return
      const duration = audio.duration
      if (Number.isFinite(duration) && duration > 0) {
        setPlaybackProgress(
          Math.min(1, Math.max(0, audio.currentTime / duration)),
        )
      }
      if (!audio.paused && !audio.ended) {
        progressFrameRef.current = requestAnimationFrame(tick)
        return
      }
      // Chromium WebM blob 2회차 재생 시 `ended` 이벤트가 발화되지 않는 버그 대응:
      // tick 에서 종료 상태를 감지하면 직접 재생 상태를 정리한다.
      // (handleEnded 가 뒤늦게 호출되더라도 setter 는 멱등하므로 안전)
      clearProgressFrame()
      setIsPlaying(false)
      if (audio.ended) setPlaybackProgress(1)
    }

    void audio
      .play()
      .then(() => {
        if (requestId !== playRequestRef.current) {
          try {
            audio.pause()
          } catch {
            // ignore
          }
          return
        }
        setIsPlaying(true)
        progressFrameRef.current = requestAnimationFrame(tick)
      })
      .catch(() => {
        if (requestId !== playRequestRef.current) return
        setIsPlaying(false)
      })
  }, [clearProgressFrame])

  const stop = useCallback(() => {
    playRequestRef.current += 1
    clearProgressFrame()
    const audio = audioRef.current
    if (audio) {
      try {
        audio.pause()
        audio.currentTime = 0
      } catch {
        // ignore
      }
    }
    setIsPlaying(false)
    setPlaybackProgress(0)
  }, [clearProgressFrame])

  /**
   * iOS 오디오 세션 해제 — 녹음 시작 직전 호출용.
   * HTMLAudioElement 는 pause() 로 재생을 중단하면 세션 자원을 반환한다.
   */
  const suspend = useCallback(() => {
    playRequestRef.current += 1
    clearProgressFrame()
    const audio = audioRef.current
    if (audio) {
      try {
        audio.pause()
      } catch {
        // ignore
      }
    }
    setIsPlaying(false)
    setPlaybackProgress(0)
  }, [clearProgressFrame])

  return {
    isPlaying,
    isAudioReady,
    audioDuration,
    playbackProgress,
    play,
    stop,
    suspend,
  }
}
