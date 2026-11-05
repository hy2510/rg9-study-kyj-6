import type { SpeakPageProps } from '@src/interfaces/study/speak/ISpeak'

/**
 * 현재 quizIndex 이후에 유효한 (Sentence 있고 Sequence 가 999 아닌) 항목이 더 있는지 검사.
 * 더 이상 없으면 마지막 퀴즈로 간주한다.
 */
export function isLastSpeakQuiz(
  speakData: SpeakPageProps[],
  quizIndex: number,
): boolean {
  return (
    speakData.filter(
      (d, i) => i > quizIndex && !!d.Sentence && d.Sequence !== 999,
    ).length === 0
  )
}
