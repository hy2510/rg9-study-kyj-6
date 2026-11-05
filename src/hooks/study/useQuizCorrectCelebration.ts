import { useCallback, useEffect, useRef, useState } from 'react'

import correctionCorrectSound from '@assets/sounds/common/correction-correct-sound.mp3'

export function useQuizCorrectCelebration() {
  const feedbackAudioRef = useRef<HTMLAudioElement | null>(null)
  const [confettiBurstKey, setConfettiBurstKey] = useState<number | null>(null)

  useEffect(() => {
    return () => {
      feedbackAudioRef.current?.pause()
      feedbackAudioRef.current = null
    }
  }, [])

  const clearConfetti = useCallback(() => {
    setConfettiBurstKey(null)
  }, [])

  const trigger = useCallback((onSoundEnd?: () => void): boolean => {
    feedbackAudioRef.current?.pause()
    const audio = new Audio(correctionCorrectSound)
    feedbackAudioRef.current = audio

    if (onSoundEnd) {
      audio.addEventListener('ended', onSoundEnd, { once: true })
      audio.addEventListener('error', onSoundEnd, { once: true })
    }

    audio.play().catch(() => {
      onSoundEnd?.()
    })
    setConfettiBurstKey((prev) => (prev ?? 0) + 1)
    return true
  }, [])

  return { confettiBurstKey, trigger, clearConfetti }
}
