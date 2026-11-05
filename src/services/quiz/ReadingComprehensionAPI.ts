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
  IReadingComprehension1,
  IReadingComprehension1Example,
  IReadingComprehension1Quiz,
  IReadingComprehension2,
  IReadingComprehension2Example,
  IReadingComprehension2Quiz,
  IReadingComprehension3,
  IReadingComprehension3Example,
  IReadingComprehension3Quiz,
  IReadingComprehension4,
  IReadingComprehension4Example,
  IReadingComprehension4Quiz,
} from '@src/interfaces/study/IReadingComprehension'

interface RawReadingComprehension1Quiz extends RawQuizId {
  Question: IReadingComprehension1Quiz['Question']
  Examples: IReadingComprehension1Quiz['Examples']
}

interface RawReadingComprehension1 extends RawQuizMetaBase {
  Quiz: RawReadingComprehension1Quiz[]
}

interface RawReadingComprehension2Quiz extends RawQuizId {
  Question: IReadingComprehension2Quiz['Question']
  Examples: IReadingComprehension2Quiz['Examples']
}

interface RawReadingComprehension2 extends RawQuizMetaBase {
  Quiz: RawReadingComprehension2Quiz[]
}

interface RawReadingComprehension3Quiz extends RawQuizId {
  Question: IReadingComprehension3Quiz['Question']
  Examples: IReadingComprehension3Quiz['Examples']
}

interface RawReadingComprehension3 extends RawQuizMetaBase {
  Quiz: RawReadingComprehension3Quiz[]
}

interface RawReadingComprehension4Quiz extends RawQuizId {
  Question: IReadingComprehension4Quiz['Question']
  Examples: IReadingComprehension4Quiz['Examples']
}

interface RawReadingComprehension4 extends RawQuizMetaBase {
  PassMark: string | number
  IsHideQuestionText: boolean
  Quiz: RawReadingComprehension4Quiz[]
}

// reading comprehension 1
async function getReadingComprehension1(
  study: IQuizStudyRef,
): Promise<IReadingComprehension1> {
  const { bookType, studyId, studentHistoryId } = study
  const typeName = 'reading-comprehension-1'
  const path = `${GET_QUIZ_DATA_PATH}/${typeName}?studentHistoryId=${studentHistoryId}&studyId=${studyId}&bookType=${bookType}`

  const transformObject = async (
    raw: RawReadingComprehension1,
  ): Promise<IReadingComprehension1> => {
    return {
      ...mapQuizMetaBase(raw),
      Quiz: raw.Quiz.map((q): IReadingComprehension1Quiz => {
        return {
          ...mapQuizId(q),
          Question: {
            Text: q.Question.Text,
            Sound: q.Question.Sound,
          },
          Examples: q.Examples.map((e): IReadingComprehension1Example => {
            return {
              Text: e.Text,
              Image: e.Image,
            }
          }),
        }
      }),
    }
  }
  return getQuizData<IReadingComprehension1>(path, transformObject)
}

// reading comprehension 2
async function getReadingComprehension2(
  study: IQuizStudyRef,
): Promise<IReadingComprehension2> {
  const { bookType, studyId, studentHistoryId } = study
  const typeName = 'reading-comprehension-2'
  const path = `${GET_QUIZ_DATA_PATH}/${typeName}?studentHistoryId=${studentHistoryId}&studyId=${studyId}&bookType=${bookType}`

  const transformObject = async (
    raw: RawReadingComprehension2,
  ): Promise<IReadingComprehension2> => {
    return {
      ...mapQuizMetaBase(raw),
      Quiz: raw.Quiz.map((q): IReadingComprehension2Quiz => {
        return {
          ...mapQuizId(q),
          Question: {
            Text: q.Question.Text,
            Image: q.Question.Image,
          },
          Examples: q.Examples.map((e): IReadingComprehension2Example => {
            return {
              Text: e.Text,
              Sound: e.Sound,
            }
          }),
        }
      }),
    }
  }
  return getQuizData<IReadingComprehension2>(path, transformObject)
}

// reading comprehension 3
async function getReadingComprehension3(
  study: IQuizStudyRef,
): Promise<IReadingComprehension3> {
  const { bookType, studyId, studentHistoryId } = study
  const typeName = 'reading-comprehension-3'
  const path = `${GET_QUIZ_DATA_PATH}/${typeName}?studentHistoryId=${studentHistoryId}&studyId=${studyId}&bookType=${bookType}`

  const transformObject = async (
    raw: RawReadingComprehension3,
  ): Promise<IReadingComprehension3> => {
    return {
      ...mapQuizMetaBase(raw),
      Quiz: raw.Quiz.map((q): IReadingComprehension3Quiz => {
        return {
          ...mapQuizId(q),
          Question: {
            Text: q.Question.Text,
            Image: q.Question.Image,
            Sound: q.Question.Sound,
          },
          Examples: q.Examples.map((e): IReadingComprehension3Example => {
            return {
              Text: e.Text,
              Sound: e.Sound,
            }
          }),
        }
      }),
    }
  }
  return getQuizData<IReadingComprehension3>(path, transformObject)
}

// reading comprehension 4
async function getReadingComprehension4(
  study: IQuizStudyRef,
): Promise<IReadingComprehension4> {
  const { bookType, studyId, studentHistoryId } = study
  const typeName = 'reading-comprehension-4'
  const path = `${GET_QUIZ_DATA_PATH}/${typeName}?studentHistoryId=${studentHistoryId}&studyId=${studyId}&bookType=${bookType}`

  const transformObject = async (
    raw: RawReadingComprehension4,
  ): Promise<IReadingComprehension4> => {
    return {
      ...mapQuizMetaBase(raw),
      PassMark: Number(raw.PassMark),
      IsHideQuestionText: Boolean(raw.IsHideQuestionText),
      Quiz: raw.Quiz.map((q): IReadingComprehension4Quiz => {
        return {
          ...mapQuizId(q),
          Question: {
            Text: q.Question.Text,
            Sound: q.Question.Sound,
          },
          Examples: q.Examples.map((e): IReadingComprehension4Example => {
            return { Text: e.Text }
          }),
        }
      }),
    }
  }
  return getQuizData<IReadingComprehension4>(path, transformObject)
}

export {
  getReadingComprehension1,
  getReadingComprehension2,
  getReadingComprehension3,
  getReadingComprehension4,
}
