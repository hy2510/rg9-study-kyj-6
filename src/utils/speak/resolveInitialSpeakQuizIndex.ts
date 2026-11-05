import type {
  ISpeakRecord,
  SpeakPageProps,
} from '@src/interfaces/study/speak/ISpeak'

/**
 * 저장된 recordedData 를 기준으로 재진입 시 시작할 quiz index 를 계산한다.
 * - 마지막 레코드 다음 index 부터 탐색하되,
 *   Contents/DataPath 가 비어 있으면 다음 유효 항목까지 건너뛴다.
 */
export function resolveInitialSpeakQuizIndex(
  speakData: SpeakPageProps[],
  recordedData: ISpeakRecord[],
): number {
  let nextIndex = 0

  if (recordedData.length > 0) {
    const lastRecord = recordedData[recordedData.length - 1]
    const lastIndex = speakData.findIndex(
      (d) =>
        d.Page === lastRecord.Page &&
        d.Sequence === lastRecord.Sequence &&
        d.DataPath !== '',
    )
    nextIndex = lastIndex + 1
  }

  while (nextIndex < speakData.length) {
    if (
      speakData[nextIndex].Contents !== '' &&
      speakData[nextIndex].DataPath !== ''
    ) {
      break
    }
    nextIndex++
  }

  return Math.min(nextIndex, speakData.length - 1)
}
