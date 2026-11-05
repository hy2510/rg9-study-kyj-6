import { useEffect, useRef, useState } from 'react'

type UseStoryAudioWordProps = {
  pauseBookAudio: () => void
}

export type StoryAudioWordPhase = 'word' | 'sentence' | null

export default function useStoryAudioWord({
  pauseBookAudio,
}: UseStoryAudioWordProps) {
  const audioRef = useRef(new Audio())
  const onEndedRef = useRef<(() => void) | null>(null)
  const player = audioRef.current
  const [playingPhase, setPlayingPhase] = useState<StoryAudioWordPhase>(null)

  const stopAudio = () => {
    onEndedRef.current = null
    setPlayingPhase(null)
    player.pause()
    player.src = ''
    player.currentTime = 0
  }

  useEffect(() => {
    const handleCanPlayThrough = () => {
      pauseBookAudio()
      player.play()
    }

    const handleEnded = () => {
      const onEnded = onEndedRef.current
      onEndedRef.current = null
      if (onEnded) {
        onEnded()
        return
      }
      setPlayingPhase(null)
    }

    player.addEventListener('canplaythrough', handleCanPlayThrough)
    player.addEventListener('ended', handleEnded)

    return () => {
      player.removeEventListener('canplaythrough', handleCanPlayThrough)
      player.removeEventListener('ended', handleEnded)
      stopAudio()
    }
  }, [])

  const playAudio = (
    src: string,
    onEnded?: () => void,
    phase: 'word' | 'sentence' = 'word',
  ) => {
    onEndedRef.current = onEnded ?? null
    setPlayingPhase(phase)
    player.src = src
  }

  return { playAudio, stopAudio, playingPhase }
}
