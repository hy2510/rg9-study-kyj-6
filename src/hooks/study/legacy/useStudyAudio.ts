import { useEffect, useRef, useState } from 'react'

import { useStudyVisibility } from '@contexts/StudyVisibilityContext'

export type PlayState = '' | 'playing' | 'paused' | 'endFn'

export default function useStudyAudio() {
  const [playState, setPlayState] = useState<PlayState>('')
  const isStudyVisible = useStudyVisibility()

  const audioRef = useRef<HTMLAudioElement>(
    (() => {
      const a = new Audio()
      a.autoplay = true
      return a
    })(),
  )
  const player = audioRef.current

  const endFn = useRef<() => void>()

  const stopAudio = () => {
    player.pause()
    player.src = ''
    player.currentTime = 0

    setPlayState('')
  }

  const pauseAudio = () => {
    if (!player.src) return
    player.pause()
    setPlayState('paused')
  }

  const resumeAudio = () => {
    if (!player.src) return
    setPlayState('playing')
    void player.play()
  }

  const seekBy = (deltaSec: number) => {
    if (!player.src) return
    const duration = Number.isFinite(player.duration) ? player.duration : null
    const next = Math.max(0, player.currentTime + deltaSec)
    player.currentTime =
      duration != null ? Math.min(next, duration) : next
  }

  useEffect(() => {
    if (playState === 'playing' || playState === 'endFn') {
      const handlerCanPlayThrough = () => {
        player.play()
      }

      player.addEventListener('canplaythrough', handlerCanPlayThrough)

      const handlerEnded = () => {
        if (playState === 'endFn') {
          if (endFn.current) {
            endFn.current()
          }
        } else {
          setPlayState('')
        }
      }

      player.addEventListener('ended', handlerEnded)

      return () => {
        player.removeEventListener('canplaythrough', handlerCanPlayThrough)
        player.removeEventListener('ended', handlerEnded)
      }
    }
  }, [playState])

  useEffect(() => {
    return () => {
      player.pause()
      player.src = ''
    }
  }, [])

  // Story ↔ Study 전환 시 활동은 마운트 유지되지만 사운드는 즉시 정지시켜
  // Story 화면에서 잔류 재생이 들리지 않도록 한다.
  // pause()만 호출하면 canplaythrough 이벤트가 발생 시 다시 play()될 수 있으므로
  // src까지 비워 완전 정지한다.
  useEffect(() => {
    if (isStudyVisible) return
    if (!player.src) return
    player.pause()
    player.src = ''
    setPlayState('')
  }, [isStudyVisible])

  const playAudio = (src: string, cb?: () => void) => {
    player.src = src

    if (cb) {
      endFn.current = cb
      setPlayState('endFn')
    } else {
      setPlayState('playing')
    }
  }

  const changePlayState = (state: PlayState) => {
    setPlayState(state)
  }

  return {
    playState,
    changePlayState,
    playAudio,
    stopAudio,
    pauseAudio,
    resumeAudio,
    seekBy,
  }
}
