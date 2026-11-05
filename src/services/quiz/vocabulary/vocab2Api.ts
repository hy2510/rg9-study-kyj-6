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
  IVocabulary2Example,
  IVocabulary2Practice,
  IVocabulary2Quiz,
  IVocabulary2Test,
  MeanLanguage,
} from '@src/interfaces/study/IVocabulary'

interface RawVocabulary2Quiz extends RawQuizId {
  Question: IVocabulary2Quiz['Question']
  Examples: IVocabulary2Quiz['Examples']
}

interface RawVocabulary2 extends RawQuizMetaBase {
  MainMeanLanguage: MeanLanguage
  SubMeanLanguage: MeanLanguage
  Quiz: RawVocabulary2Quiz[]
}

export async function getVocabularyPractice2(
  study: IQuizStudyRef,
): Promise<IVocabulary2Practice> {
  const { bookType, studyId, studentHistoryId } = study
  const path = `${GET_QUIZ_DATA_PATH}/vocabulary-2-practice?studentHistoryId=${studentHistoryId}&studyId=${studyId}&bookType=${bookType}`

  const transformObject = async (
    raw: RawVocabulary2,
  ): Promise<IVocabulary2Practice> => {
    return {
      ...mapQuizMetaBase(raw),
      MainMeanLanguage: raw.MainMeanLanguage,
      SubMeanLanguage: raw.SubMeanLanguage,
      Quiz: raw.Quiz.map((q): IVocabulary2Quiz => {
        return {
          ...mapQuizId(q),
          Question: {
            Text: q.Question.Text,
            Image: q.Question.Image,
            Sound: q.Question.Sound,
            Word: q.Question.Word,
            WordSound: q.Question.WordSound,
            SpeechPart: q.Question.SpeechPart,
            Korean: q.Question.Korean,
            Chinese: q.Question.Chinese,
            Japanese: q.Question.Japanese,
            Vietnamese: q.Question.Vietnamese,
            Indonesian: q.Question.Indonesian,
            English: q.Question.English,
            Britannica: q.Question.Britannica,
          },
          Examples: q.Examples.map((e): IVocabulary2Example => {
            return {
              Text: e.Text,
            }
          }),
        }
      }),
    }
  }
  return getQuizData<IVocabulary2Test>(path, transformObject)
}

export async function getVocabularyTest2(
  study: IQuizStudyRef,
): Promise<IVocabulary2Test> {
  const { bookType, studyId, studentHistoryId } = study
  const path = `${GET_QUIZ_DATA_PATH}/vocabulary-2?studentHistoryId=${studentHistoryId}&studyId=${studyId}&bookType=${bookType}`

  const transformObject = async (
    raw: RawVocabulary2,
  ): Promise<IVocabulary2Test> => {
    return {
      ...mapQuizMetaBase(raw),
      MainMeanLanguage: raw.MainMeanLanguage,
      SubMeanLanguage: raw.SubMeanLanguage,
      Quiz: raw.Quiz.map((q): IVocabulary2Quiz => {
        return {
          ...mapQuizId(q),
          Question: {
            Text: q.Question.Text,
            Image: q.Question.Image,
            Sound: q.Question.Sound,
            Word: q.Question.Word,
            WordSound: q.Question.WordSound,
            SpeechPart: q.Question.SpeechPart,
            Korean: q.Question.Korean,
            Chinese: q.Question.Chinese,
            Japanese: q.Question.Japanese,
            Vietnamese: q.Question.Vietnamese,
            Indonesian: q.Question.Indonesian,
            English: q.Question.English,
            Britannica: q.Question.Britannica,
          },
          Examples: q.Examples.map((e): IVocabulary2Example => {
            return {
              Text: e.Text,
            }
          }),
        }
      }),
    }
  }
  return getQuizData<IVocabulary2Test>(path, transformObject)
}
