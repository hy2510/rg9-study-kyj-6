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
  IVocabulary4Example,
  IVocabulary4Practice,
  IVocabulary4Quiz,
  IVocabulary4Test,
  MeanLanguage,
} from '@src/interfaces/study/IVocabulary'

interface RawVocabulary4Quiz extends RawQuizId {
  Question: IVocabulary4Quiz['Question']
  Examples: IVocabulary4Quiz['Examples']
}

interface RawVocabulary4 extends RawQuizMetaBase {
  MainMeanLanguage: MeanLanguage
  SubMeanLanguage: MeanLanguage
  Quiz: RawVocabulary4Quiz[]
}

export async function getVocabularyPractice4(
  study: IQuizStudyRef,
): Promise<IVocabulary4Practice> {
  const { bookType, studyId, studentHistoryId } = study
  const path = `${GET_QUIZ_DATA_PATH}/vocabulary-4-practice?studentHistoryId=${studentHistoryId}&studyId=${studyId}&bookType=${bookType}`

  const transformObject = async (
    raw: RawVocabulary4,
  ): Promise<IVocabulary4Practice> => {
    return {
      ...mapQuizMetaBase(raw),
      MainMeanLanguage: raw.MainMeanLanguage,
      SubMeanLanguage: raw.SubMeanLanguage,
      Quiz: raw.Quiz.map((q): IVocabulary4Quiz => {
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
          Examples: q.Examples.map((e): IVocabulary4Example => {
            return {
              Text: e.Text,
            }
          }),
        }
      }),
    }
  }
  return getQuizData<IVocabulary4Practice>(path, transformObject)
}

export async function getVocabularyTest4(
  study: IQuizStudyRef,
): Promise<IVocabulary4Test> {
  const { bookType, studyId, studentHistoryId } = study
  const path = `${GET_QUIZ_DATA_PATH}/vocabulary-4?studentHistoryId=${studentHistoryId}&studyId=${studyId}&bookType=${bookType}`

  const transformObject = async (
    raw: RawVocabulary4,
  ): Promise<IVocabulary4Test> => {
    return {
      ...mapQuizMetaBase(raw),
      MainMeanLanguage: raw.MainMeanLanguage,
      SubMeanLanguage: raw.SubMeanLanguage,
      Quiz: raw.Quiz.map((q): IVocabulary4Quiz => {
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
          Examples: q.Examples.map((e): IVocabulary4Example => {
            return {
              Text: e.Text,
            }
          }),
        }
      }),
    }
  }
  return getQuizData<IVocabulary4Test>(path, transformObject)
}
