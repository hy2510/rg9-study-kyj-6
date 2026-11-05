import type { RecordingResult } from '@hooks/story/useVocaRecordingAnalysis'

/**
 * VocabularyTest3 Practice 그룹 크기 (사내 정책).
 * `quizNo` 를 이 값으로 나눠 그룹 시작 여부를 판단한다.
 */
export const PRACTICE_GROUP_SIZE = 5

export function isPracticeGroupStart(quizNo: number): boolean {
  return (quizNo - 1) % PRACTICE_GROUP_SIZE === 0
}

export function isPracticeRecordingSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.mediaDevices?.getUserMedia === 'function' &&
    typeof MediaRecorder !== 'undefined'
  )
}

/**
 * 녹음 상태 + 결과 → i18n key 매핑.
 * - `isRecordingMode` / `isAnalyzing` 가 우선순위를 가진다.
 * - 그 외는 `recordingResult` 값으로 결정, 미설정이면 전달받은 `defaultPromptKey` 로 폴백.
 */
export function resolveVocabularyTest3PronunciationLabelKey({
  isRecordingMode,
  isAnalyzing,
  recordingResult,
  defaultPromptKey,
}: {
  isRecordingMode: boolean
  isAnalyzing: boolean
  recordingResult: RecordingResult | undefined
  defaultPromptKey: string
}): string {
  if (isRecordingMode) return 'study.vocabularyPractice.recording'
  if (isAnalyzing) return 'study.vocabularyPractice.analyzing'
  switch (recordingResult) {
    case 'correct':
      return 'study.vocabularyPractice.goodJob'
    case 'incorrect':
      return 'study.vocabularyPractice.tryAgain'
    case 'unsupported':
      return 'study.vocabularyPractice.unsupported'
    case 'microphone-unavailable':
      return 'study.vocabularyPractice.microphoneUnavailable'
    case 'error':
      return 'study.vocabularyPractice.error'
    default:
      return defaultPromptKey
  }
}
