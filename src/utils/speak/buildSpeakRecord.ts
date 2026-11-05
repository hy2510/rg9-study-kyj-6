import type {
  LocalSpeakRecord,
  SpeakPageProps,
} from '@src/interfaces/study/speak/ISpeak'

/**
 * SpeakPage 항목으로부터 저장용 `LocalSpeakRecord` 조립.
 * - 세부 점수 (Word/Pronunciation/Prosody/Intonation/Timing/Loudness) 는 0 으로 초기화.
 * - `matchedWordIndexes` 와 `isSkipped` 는 선택적으로 세팅.
 */
export function buildSpeakRecord(
  item: SpeakPageProps,
  scoreOverall: number,
  matchedWordIndexes?: number[],
  isSkipped: boolean = false,
): LocalSpeakRecord {
  return {
    Page: item.Page,
    Sequence: item.Sequence,
    QuizNo: item.QuizNo,
    Sentence: item.Sentence,
    ScoreOverall: scoreOverall,
    ScoreWord: 0,
    ScorePronunciation: 0,
    ScoreProsody: 0,
    ScoreIntonation: 0,
    ScoreTiming: 0,
    ScoreLoudness: 0,
    matchedWordIndexes,
    isSkipped,
  }
}
