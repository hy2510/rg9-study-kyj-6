import { useEffect, useRef } from 'react'

import correctionCorrectSound from '@assets/sounds/common/correction-correct-sound.mp3'
import correctionIncorrectSound from '@assets/sounds/common/correction-incorrect-sound.mp3'
import type { SpeakRecordingResult } from '@src/hooks/story/useSpeakRecordingAnalysis'

/**
 * Speak 녹음 결과 (`correct` / `incorrect`) 에 맞춰 피드백 사운드를 재생한다.
 *
 * - 사용자 제스처가 유효한 시점에서 `prepareFeedbackAudio()` 를 한번 호출해야
 *   iOS 에서도 AudioContext 가 resume + buffer 사전 로드된다.
 * - 호출 이후 `recordingResult` 가 `correct` / `incorrect` 로 바뀌면 자동 재생.
 */
export default function useSpeakFeedbackSound(
  recordingResult: SpeakRecordingResult | undefined,
) {
  const feedbackContextRef = useRef<AudioContext | null>(null)
  const feedbackBuffersRef = useRef<
    Partial<Record<'correct' | 'incorrect', AudioBuffer>>
  >({})
  const feedbackLoadRef = useRef<Promise<void> | null>(null)

  const prepareFeedbackAudio = () => {
    if (!feedbackContextRef.current) {
      const AudioContextConstructor =
        window.AudioContext ||
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext
          }
        ).webkitAudioContext
      if (!AudioContextConstructor) return
      feedbackContextRef.current = new AudioContextConstructor()
    }

    const context = feedbackContextRef.current
    void context.resume()
    if (!feedbackLoadRef.current) {
      feedbackLoadRef.current = Promise.all(
        [
          ['correct', correctionCorrectSound],
          ['incorrect', correctionIncorrectSound],
        ].map(async ([key, url]) => {
          const response = await fetch(url)
          const buffer = await context.decodeAudioData(
            await response.arrayBuffer(),
          )
          feedbackBuffersRef.current[key as 'correct' | 'incorrect'] = buffer
        }),
      ).then(() => undefined)
    }
  }

  useEffect(() => {
    if (recordingResult !== 'correct' && recordingResult !== 'incorrect') return
    let cancelled = false
    const playFeedback = async () => {
      await feedbackLoadRef.current
      if (cancelled) return
      const context = feedbackContextRef.current
      const buffer = feedbackBuffersRef.current[recordingResult]
      if (!context || !buffer) return
      if (context.state === 'suspended') await context.resume().catch(() => {})
      if (cancelled || context.state !== 'running') return
      const source = context.createBufferSource()
      source.buffer = buffer
      source.connect(context.destination)
      source.start()
    }
    void playFeedback()
    return () => {
      cancelled = true
    }
  }, [recordingResult])

  return { prepareFeedbackAudio }
}
