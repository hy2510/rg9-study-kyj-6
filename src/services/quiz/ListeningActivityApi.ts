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
  IListeningActivity1,
  IListeningActivity1Example,
  IListeningActivity1Quiz,
  IListeningActivity2,
  IListeningActivity2Example,
  IListeningActivity2Quiz,
  IListeningActivity3,
  IListeningActivity3Example,
  IListeningActivity3Quiz,
  IListeningActivity4,
  IListeningActivity4Example,
  IListeningActivity4Quiz,
} from '@src/interfaces/study/IListeningActivity'

interface RawListeningActivity1Quiz extends RawQuizId {
  Question: IListeningActivity1Quiz['Question']
}

interface RawListeningActivity1 extends RawQuizMetaBase {
  Quiz: RawListeningActivity1Quiz[]
  Examples: IListeningActivity1['Examples']
}

interface RawListeningActivity2Quiz extends RawQuizId {
  Question: IListeningActivity2Quiz['Question']
}

interface RawListeningActivity2 extends RawQuizMetaBase {
  Quiz: RawListeningActivity2Quiz[]
  Examples: IListeningActivity2['Examples']
}

interface RawListeningActivity3Quiz extends RawQuizId {
  Question: IListeningActivity3Quiz['Question']
  Examples: IListeningActivity3Quiz['Examples']
}

interface RawListeningActivity3 extends RawQuizMetaBase {
  Quiz: RawListeningActivity3Quiz[]
}

interface RawListeningActivity4Quiz extends RawQuizId {
  Question: IListeningActivity4Quiz['Question']
  Examples: IListeningActivity4Quiz['Examples']
}

interface RawListeningActivity4 extends RawQuizMetaBase {
  Quiz: RawListeningActivity4Quiz[]
}

// listening activity 1
async function getListeningActivity1(
  study: IQuizStudyRef,
): Promise<IListeningActivity1> {
  const { bookType, studyId, studentHistoryId } = study
  const typeName = 'listening-activity-1'
  const path = `${GET_QUIZ_DATA_PATH}/${typeName}?studentHistoryId=${studentHistoryId}&studyId=${studyId}&bookType=${bookType}`

  const transformObject = async (
    raw: RawListeningActivity1,
  ): Promise<IListeningActivity1> => {
    return {
      ...mapQuizMetaBase(raw),
      Quiz: raw.Quiz.map((q): IListeningActivity1Quiz => {
        return {
          ...mapQuizId(q),
          Question: {
            Text: q.Question.Text,
            Sound: q.Question.Sound,
          },
        }
      }),
      Examples: raw.Examples.map((e): IListeningActivity1Example => {
        return {
          Text: e.Text,
          Image: e.Image,
        }
      }),
    }
  }
  return getQuizData<IListeningActivity1>(path, transformObject)
}

// listening activity 2
async function getListeningActivity2(
  study: IQuizStudyRef,
): Promise<IListeningActivity2> {
  const { bookType, studyId, studentHistoryId } = study
  const typeName = 'listening-activity-2'
  const path = `${GET_QUIZ_DATA_PATH}/${typeName}?studentHistoryId=${studentHistoryId}&studyId=${studyId}&bookType=${bookType}`

  const transformObject = async (
    raw: RawListeningActivity2,
  ): Promise<IListeningActivity2> => {
    return {
      ...mapQuizMetaBase(raw),
      Quiz: raw.Quiz.map((q): IListeningActivity2Quiz => {
        return {
          ...mapQuizId(q),
          Question: {
            Text: q.Question.Text,
            Sound: q.Question.Sound,
          },
        }
      }),
      Examples: raw.Examples.map((e): IListeningActivity2Example => {
        return {
          Text: e.Text,
        }
      }),
    }
  }
  return getQuizData<IListeningActivity2>(path, transformObject)
}

// listening activity 3
async function getListeningActivity3(
  study: IQuizStudyRef,
): Promise<IListeningActivity3> {
  const { bookType, studyId, studentHistoryId } = study
  const typeName = 'listening-activity-3'
  const path = `${GET_QUIZ_DATA_PATH}/${typeName}?studentHistoryId=${studentHistoryId}&studyId=${studyId}&bookType=${bookType}`

  const transformObject = async (
    raw: RawListeningActivity3,
  ): Promise<IListeningActivity3> => {
    return {
      ...mapQuizMetaBase(raw),
      Quiz: raw.Quiz.map((q): IListeningActivity3Quiz => {
        return {
          ...mapQuizId(q),
          Question: {
            Text: q.Question.Text,
            Sound: q.Question.Sound,
          },
          Examples: q.Examples.map((e): IListeningActivity3Example => {
            return {
              Text: e.Text,
              Image: e.Image,
            }
          }),
        }
      }),
    }
  }
  return getQuizData<IListeningActivity3>(path, transformObject)
}

// listening acrivity 4
async function getListeningActivity4(
  study: IQuizStudyRef,
): Promise<IListeningActivity4> {
  const { bookType, studyId, studentHistoryId } = study
  const typeName = 'listening-activity-4'
  const path = `${GET_QUIZ_DATA_PATH}/${typeName}?studentHistoryId=${studentHistoryId}&studyId=${studyId}&bookType=${bookType}`

  const transformObject = async (
    raw: RawListeningActivity4,
  ): Promise<IListeningActivity4> => {
    return {
      ...mapQuizMetaBase(raw),
      Quiz: raw.Quiz.map((q): IListeningActivity4Quiz => {
        return {
          ...mapQuizId(q),
          Question: {
            Text: q.Question.Text,
            Image: q.Question.Image,
          },
          Examples: q.Examples.map((e): IListeningActivity4Example => {
            return {
              Text: e.Text,
              Sound: e.Sound,
            }
          }),
        }
      }),
    }
  }
  return getQuizData<IListeningActivity4>(path, transformObject)
}

export {
  getListeningActivity1,
  getListeningActivity2,
  getListeningActivity3,
  getListeningActivity4,
}
