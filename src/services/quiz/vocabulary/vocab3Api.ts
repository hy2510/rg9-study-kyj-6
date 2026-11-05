import {
  mapQuizId,
  mapQuizMetaBase,
  RawQuizId,
  RawQuizMetaBase,
} from '@services/quiz/rawQuizTransform'
import { getQuizData } from '@services/studyApi'
import { GET_QUIZ_DATA_PATH } from '@src/constants/study/studyConstants'
import { IQuizStudyRef } from '@src/interfaces/common/Common'
import {
  IVocabulary3Hint,
  IVocabulary3Practice,
  IVocabulary3Quiz,
  IVocabulary3Test,
  MeanLanguage,
} from '@src/interfaces/study/IVocabulary'

interface RawVocabulary3Quiz extends RawQuizId {
  Question: IVocabulary3Quiz['Question']
}

interface RawVocabulary3Practice extends RawQuizMetaBase {
  IsEnabledTyping: IVocabulary3Practice['IsEnabledTyping']
  IsSkipAvailable: IVocabulary3Practice['IsSkipAvailable']
  MainMeanLanguage: MeanLanguage
  SubMeanLanguage: MeanLanguage
  Quiz: RawVocabulary3Quiz[]
}

interface RawVocabulary3Test extends RawQuizMetaBase {
  IsEnablePenaltyReview: boolean
  MainMeanLanguage: MeanLanguage
  SubMeanLanguage: MeanLanguage
  Hint: IVocabulary3Hint
  Quiz: RawVocabulary3Quiz[]
}

export async function getVocabularyPractice3(
  study: IQuizStudyRef,
): Promise<IVocabulary3Practice> {
  const { bookType, studyId, studentHistoryId } = study
  const path = `${GET_QUIZ_DATA_PATH}/vocabulary-3-practice?studentHistoryId=${studentHistoryId}&studyId=${studyId}&bookType=${bookType}`

  const transformObject = async (
    raw: RawVocabulary3Practice,
  ): Promise<IVocabulary3Practice> => {
    return {
      ...mapQuizMetaBase(raw),
      IsEnabledTyping: raw.IsEnabledTyping,
      IsSkipAvailable: raw.IsSkipAvailable,
      MainMeanLanguage: raw.MainMeanLanguage,
      SubMeanLanguage: raw.SubMeanLanguage,
      Quiz: raw.Quiz.map((q): IVocabulary3Quiz => {
        return {
          ...mapQuizId(q),
          Question: {
            Text: q.Question.Text,
            Sound: q.Question.Sound,
            SpeechPart: q.Question.SpeechPart,
            Korean: q.Question.Korean,
            Chinese: q.Question.Chinese,
            Japanese: q.Question.Japanese,
            Vietnamese: q.Question.Vietnamese,
            Indonesian: q.Question.Indonesian,
            English: q.Question.English,
            Britannica: q.Question.Britannica,
          },
        }
      }),
    }
  }
  return getQuizData<IVocabulary3Practice>(path, transformObject)
}

export async function getVocabularyTest3(
  study: IQuizStudyRef,
): Promise<IVocabulary3Test> {
  const { bookType, studyId, studentHistoryId } = study
  const path = `${GET_QUIZ_DATA_PATH}/vocabulary-3?studentHistoryId=${studentHistoryId}&studyId=${studyId}&bookType=${bookType}`

  const transformObject = async (
    raw: RawVocabulary3Test,
  ): Promise<IVocabulary3Test> => {
    return {
      ...mapQuizMetaBase(raw),
      MainMeanLanguage: raw.MainMeanLanguage,
      SubMeanLanguage: raw.SubMeanLanguage,
      IsEnablePenaltyReview: Boolean(raw.IsEnablePenaltyReview),
      Hint: {
        IsEnabled: raw.Hint.IsEnabled,
        Max: raw.Hint.Max,
        Try: raw.Hint.Try,
      },
      Quiz: raw.Quiz.map((q): IVocabulary3Quiz => {
        return {
          ...mapQuizId(q),
          Question: {
            Text: q.Question.Text,
            Sound: q.Question.Sound,
            SpeechPart: q.Question.SpeechPart,
            Korean: q.Question.Korean,
            Chinese: q.Question.Chinese,
            Japanese: q.Question.Japanese,
            Vietnamese: q.Question.Vietnamese,
            Indonesian: q.Question.Indonesian,
            English: q.Question.English,
            Britannica: q.Question.Britannica,
          },
        }
      }),
    }
  }
  return getQuizData<IVocabulary3Test>(path, transformObject)
}
