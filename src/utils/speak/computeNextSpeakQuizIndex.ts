import type { SpeakPageProps } from '@src/interfaces/study/speak/ISpeak'

/**
 * `Sequence === 999` (내비게이션/페이지 전환용 더미) 항목을 건너뛰며
 * 다음 유효 quiz index 를 계산한다. 범위를 넘으면 마지막 index 로 clamp.
 */
export function computeNextSpeakQuizIndex(
  speakData: SpeakPageProps[],
  from: number,
): number {
  let next = from
  while (next < speakData.length && speakData[next]?.Sequence === 999) {
    next++
  }
  return Math.min(next, speakData.length - 1)
}
