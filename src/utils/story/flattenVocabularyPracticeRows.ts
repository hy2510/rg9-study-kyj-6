import type {
  IVocabulary1Practice,
  IVocabulary2Practice,
  IVocabulary3Practice,
  IVocabulary4Practice,
} from '@src/interfaces/study/IVocabulary'
import { getMeaning } from '@utils/story/getVocaMeaning'

export type StoryVocaKeywordRow = {
  id: string
  word: string
  meaning: string
  speechPart: string
  soundUrl: string
}

/** Vocabulary1~4 데이터의 단어·뜻·발음 URL 추출 규칙 */
export function flattenVocabularyPracticeToRows(
  vocaData1?: IVocabulary1Practice,
  vocaData2?: IVocabulary2Practice,
  vocaData3?: IVocabulary3Practice,
  vocaData4?: IVocabulary4Practice,
): StoryVocaKeywordRow[] {
  if (vocaData1) {
    return vocaData1.Quiz.map((q, i) => ({
      id: `v1-${q.QuizId}-${i}`,
      word: q.Examples[0]?.Text ? q.Examples[0].Text : q.Question.Text,
      meaning: getMeaning(q.Question, vocaData1.MainMeanLanguage),
      speechPart: q.Question.SpeechPart,
      soundUrl: q.Question.Sound,
    }))
  }
  if (vocaData2) {
    return vocaData2.Quiz.map((q, i) => ({
      id: `v2-${q.QuizId}-${i}`,
      word: q.Examples[0]?.Text ? q.Question.Word : q.Question.Text,
      meaning: getMeaning(q.Question, vocaData2.MainMeanLanguage),
      speechPart: q.Question.SpeechPart,
      soundUrl: q.Question.WordSound,
    }))
  }
  if (vocaData3) {
    return vocaData3.Quiz.map((q, i) => ({
      id: `v3-${q.QuizId}-${i}`,
      word: q.Question.Text,
      meaning: getMeaning(q.Question, vocaData3.MainMeanLanguage),
      speechPart: q.Question.SpeechPart,
      soundUrl: q.Question.Sound,
    }))
  }
  if (vocaData4) {
    return vocaData4.Quiz.map((q, i) => ({
      id: `v4-${q.QuizId}-${i}`,
      word: q.Examples[0]?.Text ? q.Examples[0].Text : q.Question.Text,
      meaning: getMeaning(q.Question, vocaData4.MainMeanLanguage),
      speechPart: q.Question.SpeechPart,
      soundUrl: q.Question.Sound,
    }))
  }
  return []
}
