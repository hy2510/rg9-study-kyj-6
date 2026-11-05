import type { LocalSpeakRecord } from '@interfaces/study/speak/ISpeak'

/**
 * Speak 결과 평균 산정.
 * - 「건너뜀」 항목도 0 점으로 포함한다 (분모 = records.length).
 * - `ScoreOverall` 이 유한값이 아닐 경우 0 으로 간주한다.
 * - 반환은 반올림된 정수 점수.
 */
export function computeSpeakAverageScore(
  records: LocalSpeakRecord[],
): number {
  if (records.length === 0) return 0
  const sum = records.reduce((acc, r) => {
    if (r.isSkipped) return acc
    return acc + (Number.isFinite(r.ScoreOverall) ? r.ScoreOverall : 0)
  }, 0)
  return Math.round(sum / records.length)
}
