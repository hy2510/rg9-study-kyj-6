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
  IVocabulary1Example,
  IVocabulary1Practice,
  IVocabulary1Quiz,
  IVocabulary1Test,
  MeanLanguage,
} from '@src/interfaces/study/IVocabulary'

interface RawVocabulary1Quiz extends RawQuizId {
  Question: IVocabulary1Quiz['Question']
  Examples: IVocabulary1Quiz['Examples']
}

interface RawVocabulary1 extends RawQuizMetaBase {
  MainMeanLanguage: MeanLanguage
  SubMeanLanguage: MeanLanguage
  Quiz: RawVocabulary1Quiz[]
}

export async function getVocabularyPractice1(
  study: IQuizStudyRef,
): Promise<IVocabulary1Practice> {
  const { bookType, studyId, studentHistoryId } = study
  const path = `${GET_QUIZ_DATA_PATH}/vocabulary-1-practice?studentHistoryId=${studentHistoryId}&studyId=${studyId}&bookType=${bookType}`

  const transformObject = async (
    raw: RawVocabulary1,
  ): Promise<IVocabulary1Practice> => {
    return {
      ...mapQuizMetaBase(raw),
      MainMeanLanguage: raw.MainMeanLanguage,
      SubMeanLanguage: raw.SubMeanLanguage,
      Quiz: raw.Quiz.map((q): IVocabulary1Quiz => {
        return {
          ...mapQuizId(q),
          Question: {
            Text: q.Question.Text,
            Image: q.Question.Image,
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
          Examples: q.Examples.map((e): IVocabulary1Example => {
            return {
              Text: e.Text,
            }
          }),
        }
      }),
    }
  }
  return getQuizData<IVocabulary1Practice>(path, transformObject)
}

export async function getVocabularyTest1(
  study: IQuizStudyRef,
): Promise<IVocabulary1Test> {
  const { bookType, studyId, studentHistoryId } = study
  const path = `${GET_QUIZ_DATA_PATH}/vocabulary-1?studentHistoryId=${studentHistoryId}&studyId=${studyId}&bookType=${bookType}`

  const transformObject = async (
    raw: RawVocabulary1,
  ): Promise<IVocabulary1Test> => {
    return {
      ...mapQuizMetaBase(raw),
      MainMeanLanguage: raw.MainMeanLanguage,
      SubMeanLanguage: raw.SubMeanLanguage,
      Quiz: raw.Quiz.map((q): IVocabulary1Quiz => {
        return {
          ...mapQuizId(q),
          Question: {
            Text: q.Question.Text,
            Image: q.Question.Image,
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
          Examples: q.Examples.map((e): IVocabulary1Example => {
            return {
              Text: e.Text,
            }
          }),
        }
      }),
    }
  }
  return getQuizData<IVocabulary1Test>(path, transformObject)
}
