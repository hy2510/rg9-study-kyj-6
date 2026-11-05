type SpeakPageProps = {
  ChallengeNumber: number
  BookId: string
  Page: number
  QuizNo: number
  Css: string
  Contents: string
  FontColor: string
  ImagePath: string
  Sequence: number
  SoundPath: string
  DataPath: string
  MarginTop: number
  MarginLeft: number
  Sentence: string
}

interface ISpeakRecord {
  Page: number
  Sequence: number
  QuizNo: number
  Sentence: string
  ScoreOverall: number
  ScoreWord: number
  ScorePronunciation: number
  ScoreProsody: number
  ScoreIntonation: number
  ScoreTiming: number
  ScoreLoudness: number
  /**
   * 저장 시 클라이언트가 보낸 wordsJson 이 그대로 반환된다.
   * 구조:
   * ```
   * { transcript: string, matchedWordIndexes: number[], matchedCount: number, totalCount: number }
   * ```
   * 이전 세션 기록에서도 값이 존재하므로 파싱하면 단어별 매칭 결과 복원 가능.
   */
  WordsJson?: string
}

/**
 * 클라이언트 세션 전용 speak record.
 *
 * - `matchedWordIndexes` 는 speech recognition 이 원문 문장에서 매칭한 단어 인덱스(0-based) 배열.
 * - `isSkipped` 는 「건너뛰기」 클릭으로 저장된 항목인지 여부.
 * - 서버 로드 시엔 `WordsJson` 을 파싱해 채운다 (기존 데이터는 휴리스틱 폴백).
 */
type LocalSpeakRecord = ISpeakRecord & {
  matchedWordIndexes?: number[]
  isSkipped?: boolean
}

interface ISpeakUserAnswer {
  studyId: string
  studentHistoryId: string
  challengeNumber: number
  page: number
  sequence: number
  quizNo: number
  sentence: string
  scoreOverall: number
  wordsJson: string
  isLastQuiz: boolean
}

interface ISpeakSaveResult {
  result: number
  resultMessage: string
}

interface IRecordResultData {
  speech_detected: boolean
  best_answer: string
  phoneme_result: {
    sentence_score: number
    words: {
      phonemes: {
        phoneme: string
        score: number
      }[]

      word: string
    }[]
  }
  score_weight: {
    accuracy: number
    intonation: number
    accent: number
    pause: number
    speed: number
  }
  score: {
    accuracy: number
    intonation: number
    accent: number
    pause: number
    speed: number
  }
  weighted_score: {
    accuracy: number
    intonation: number
    accent: number
    pause: number
    speed: number
  }
  total_score: number
}

interface IPhonemeResult {
  average_phoneme_score: number
  speech_detected: boolean
  words: {
    phonemes: {
      phoneme: string
      score: number
    }[]

    word: string
  }[]
}

interface IResultPhoneme {
  alphabet: string
  index_start: number
  index_end: number
  phonemes: string[]
  score: number
}

type PageState = '' | 'play' | 'left' | 'right'
type PageSequenceProps = {
  playPage: number
  sequnce: number
}

// 오디오 상태
type PlayState = '' | 'play' | 'play-sentence' | 'play-user-sound'
type RecordState = '' | 'recording'

export type {
  IPhonemeResult,
  IRecordResultData,
  ISpeakRecord,
  ISpeakSaveResult,
  ISpeakUserAnswer,
  LocalSpeakRecord,
  PageSequenceProps,
  PageState,
  PlayState,
  RecordState,
  SpeakPageProps,
}
