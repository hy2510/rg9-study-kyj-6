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
  ITrueOrFalse,
  ITrueOrFalseExample,
  ITrueOrFalseQuiz,
} from '@src/interfaces/study/ITrueOrFalse'

interface RawTrueOrFalseQuiz extends RawQuizId {
  Question: ITrueOrFalseQuiz['Question']
  Examples: ITrueOrFalseQuiz['Examples']
}

interface RawTrueOrFalse extends RawQuizMetaBase {
  Quiz: RawTrueOrFalseQuiz[]
}

async function getTrueOrFalse(study: IQuizStudyRef): Promise<ITrueOrFalse> {
  const { bookType, studyId, studentHistoryId } = study
  const typeName = 'true-or-false'
  const path = `${GET_QUIZ_DATA_PATH}/${typeName}?studentHistoryId=${studentHistoryId}&studyId=${studyId}&bookType=${bookType}`

  const transformObject = async (
    raw: RawTrueOrFalse,
  ): Promise<ITrueOrFalse> => {
    return {
      ...mapQuizMetaBase(raw),
      Quiz: raw.Quiz.map((q): ITrueOrFalseQuiz => {
        return {
          ...mapQuizId(q),
          Question: {
            Text: q.Question.Text,
            Sound: q.Question.Sound,
          },
          Examples: q.Examples.map((e): ITrueOrFalseExample => {
            return {
              Text: e.Text,
              Sound: e.Sound,
            }
          }),
        }
      }),
    }
  }
  return getQuizData<ITrueOrFalse>(path, transformObject)
}

export { getTrueOrFalse }
