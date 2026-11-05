import { useCallback, useEffect, useRef, useState } from 'react'

type UseSpeakAudioProps = {
  soundPath: string
  onEnded?: () => void
}

/**
 * Speak 활동 문장 재생 훅 (HTMLAudioElement 기반).
 *
 * - OS 가 미디어 세션(playback) 으로 승격해 볼륨 키 → 미디어 볼륨으로 조절된다.
 * - Web Audio API 로 재생하면 iOS 가 ambient 세션으로 유지해 볼륨 키가 벨소리 볼륨만
 *   조절하는 문제가 있어 HTMLAudioElement 로 통일한다.
 *
 * 공개 API 는 기존과 동일 (isPlaying / isAudioReady / audioDuration /
 * playbackProgress / play / reset / suspend).
 */
export default function useSpeakAudio({
  soundPath,
  onEnded,
}: UseSpeakAudioProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
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
    if (!soundPath) return

    setIsAudioReady(false)
    setAudioDuration(0)
    setPlaybackProgress(0)
    setIsPlaying(false)
    clearProgressFrame()

    const audio = new Audio()
    audio.preload = 'auto'

    const handleReady = () => {
      const duration = audio.duration
      if (Number.isFinite(duration) && duration > 0) {
        setAudioDuration(duration)
      }
      setIsAudioReady(true)
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

    audio.addEventListener('loadedmetadata', handleReady)
    audio.addEventListener('canplaythrough', handleReady)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    audio.src = soundPath
    audio.load()
    audioRef.current = audio

    return () => {
      playRequestRef.current += 1
      clearProgressFrame()
      audio.removeEventListener('loadedmetadata', handleReady)
      audio.removeEventListener('canplaythrough', handleReady)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      try {
        audio.pause()
      } catch {
        // ignore
      }
      audio.src = ''
      if (audioRef.current === audio) audioRef.current = null
    }
  }, [soundPath, clearProgressFrame])

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
      }
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

  const reset = useCallback(() => {
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
   *
   * HTMLAudioElement 는 pause() 로 재생을 멈추면 세션 자원을 반환하므로
   * 이후 MediaRecorder / SpeechRecognition 이 마이크 세션을 획득할 수 있다.
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
    reset,
    suspend,
  }
}
