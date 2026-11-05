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
  IClozeTest1,
  IClozeTest1Example,
  IClozeTest1Quiz,
  IClozeTest2,
  IClozeTest2Example,
  IClozeTest2Quiz,
  IClozeTest3,
  IClozeTest3Example,
  IClozeTest3Quiz,
} from '@src/interfaces/study/IClozeTest'

interface RawClozeTest1Quiz extends RawQuizId {
  Question: IClozeTest1Quiz['Question']
  Examples: IClozeTest1Quiz['Examples']
}

interface RawClozeTest1 extends RawQuizMetaBase {
  Quiz: RawClozeTest1Quiz[]
}

interface RawClozeTest2Quiz extends RawQuizId {
  Question: IClozeTest2Quiz['Question']
  Examples: IClozeTest2Quiz['Examples']
}

interface RawClozeTest2 extends RawQuizMetaBase {
  IsEnablePenaltyReview: boolean
  Quiz: RawClozeTest2Quiz[]
}

interface RawClozeTest3Quiz extends RawQuizId {
  Question: IClozeTest3Quiz['Question']
  Examples: IClozeTest3Quiz['Examples']
}

interface RawClozeTest3 extends RawQuizMetaBase {
  IsEnablePenaltyReview: boolean
  Quiz: RawClozeTest3Quiz[]
}

// cloze test 1
async function getClozeTest1(study: IQuizStudyRef): Promise<IClozeTest1> {
  const { bookType, studyId, studentHistoryId } = study
  const typeName = 'cloze-test-1'
  const path = `${GET_QUIZ_DATA_PATH}/${typeName}?studentHistoryId=${studentHistoryId}&studyId=${studyId}&bookType=${bookType}`

  const transformObject = async (raw: RawClozeTest1): Promise<IClozeTest1> => {
    return {
      ...mapQuizMetaBase(raw),
      Quiz: raw.Quiz.map((q): IClozeTest1Quiz => {
        return {
          ...mapQuizId(q),
          Question: {
            Text: q.Question.Text,
            Sound: q.Question.Sound,
          },
          Examples: q.Examples.map((e): IClozeTest1Example => {
            return {
              Text: e.Text,
            }
          }),
        }
      }),
    }
  }
  return getQuizData<IClozeTest1>(path, transformObject)
}

// cloze test 2
async function getClozeTest2(study: IQuizStudyRef): Promise<IClozeTest2> {
  const { bookType, studyId, studentHistoryId } = study
  const typeName = 'cloze-test-2'
  const path = `${GET_QUIZ_DATA_PATH}/${typeName}?studentHistoryId=${studentHistoryId}&studyId=${studyId}&bookType=${bookType}`

  const transformObject = async (raw: RawClozeTest2): Promise<IClozeTest2> => {
    return {
      ...mapQuizMetaBase(raw),
      IsEnablePenaltyReview: Boolean(raw.IsEnablePenaltyReview),
      Quiz: raw.Quiz.map((q): IClozeTest2Quiz => {
        return {
          ...mapQuizId(q),
          Question: {
            Text: q.Question.Text,
            Sound: q.Question.Sound,
          },
          Examples: q.Examples.map((e): IClozeTest2Example => {
            return { Text: e.Text }
          }),
        }
      }),
    }
  }
  return getQuizData<IClozeTest2>(path, transformObject)
}

// cloze test 3
async function getClozeTest3(study: IQuizStudyRef): Promise<IClozeTest3> {
  const { bookType, studyId, studentHistoryId } = study
  const typeName = 'cloze-test-3'
  const path = `${GET_QUIZ_DATA_PATH}/${typeName}?studentHistoryId=${studentHistoryId}&studyId=${studyId}&bookType=${bookType}`

  const transformObject = async (raw: RawClozeTest3): Promise<IClozeTest3> => {
    return {
      ...mapQuizMetaBase(raw),
      IsEnablePenaltyReview: Boolean(raw.IsEnablePenaltyReview),
      Quiz: raw.Quiz.map((q): IClozeTest3Quiz => {
        return {
          ...mapQuizId(q),
          Question: {
            Text: q.Question.Text,
            Sound: q.Question.Sound,
          },
          Examples: q.Examples.map((e): IClozeTest3Example => {
            return { Text: e.Text }
          }),
        }
      }),
    }
  }
  return getQuizData<IClozeTest3>(path, transformObject)
}

export { getClozeTest1, getClozeTest2, getClozeTest3 }
