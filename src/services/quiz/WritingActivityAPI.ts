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
  IWritingActivity1,
  IWritingActivity1Example,
  IWritingActivity1Quiz,
  IWritingActivity2,
} from '@src/interfaces/study/IWritingActivity'

interface RawWritingActivity1Quiz extends RawQuizId {
  Question: IWritingActivity1Quiz['Question']
  Examples: IWritingActivity1Quiz['Examples']
}

interface RawWritingActivity1 extends RawQuizMetaBase {
  Quiz: RawWritingActivity1Quiz[]
}

interface RawWritingActivity2 {
  QuizTime: IWritingActivity2['QuizTime']
  Title: IWritingActivity2['Title']
  Author: IWritingActivity2['Author']
  Writing: IWritingActivity2['Writing']
  Rewriting: IWritingActivity2['Rewriting']
}

// writing activity 1
async function getWritingActivity1(
  study: IQuizStudyRef,
): Promise<IWritingActivity1> {
  const { bookType, studyId, studentHistoryId } = study
  const typeName = 'writing-activity-1'
  const path = `${GET_QUIZ_DATA_PATH}/${typeName}?studentHistoryId=${studentHistoryId}&studyId=${studyId}&bookType=${bookType}`

  const transformObject = async (
    raw: RawWritingActivity1,
  ): Promise<IWritingActivity1> => {
    return {
      ...mapQuizMetaBase(raw),
      Quiz: raw.Quiz.map((q): IWritingActivity1Quiz => {
        return {
          ...mapQuizId(q),
          Question: {
            Text: q.Question.Text,
            Sound: q.Question.Sound,
          },
          Examples: q.Examples.map((e): IWritingActivity1Example => {
            return {
              Text: e.Text,
            }
          }),
        }
      }),
    }
  }
  return getQuizData<IWritingActivity1>(path, transformObject)
}

// writing activity 2
async function getWritingActivity2(
  study: IQuizStudyRef,
): Promise<IWritingActivity2> {
  const { bookType, studyId, studentHistoryId } = study
  const typeName = 'writing-activity-2'
  const path = `${GET_QUIZ_DATA_PATH}/${typeName}?studentHistoryId=${studentHistoryId}&studyId=${studyId}&bookType=${bookType}`

  const transformObject = async (
    raw: RawWritingActivity2,
  ): Promise<IWritingActivity2> => {
    return {
      QuizTime: raw.QuizTime,
      Title: raw.Title,
      Author: raw.Author,
      Writing: raw.Writing,
      Rewriting: raw.Rewriting,
    }
  }
  return getQuizData<IWritingActivity2>(path, transformObject)
}

export { getWritingActivity1, getWritingActivity2 }
