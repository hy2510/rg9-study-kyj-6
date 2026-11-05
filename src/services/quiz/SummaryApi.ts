import {
  mapQuizId,
  mapQuizMetaBase,
  RawQuizId,
  RawQuizMetaBase,
} from '@services/quiz/rawQuizTransform'
import { getQuizData } from '@services/studyApi'
import {
  GET_HINT_PATH,
  GET_QUIZ_DATA_PATH,
} from '@src/constants/study/studyConstants'
import { IQuizStudyRef } from '@src/interfaces/common/Common'
import {
  ISummary1,
  ISummary1Quiz,
  ISummary2,
  ISummary2Example,
  ISummary2Quiz,
  ISummary2Sentence,
} from '@src/interfaces/study/ISummary'
import { IHint } from '@src/interfaces/study/IVocabulary'

interface RawSummary1Quiz extends RawQuizId {
  Question: ISummary1Quiz['Question']
}

interface RawSummary1 extends RawQuizMetaBase {
  IsEnablePenaltyReview: boolean
  Hint: ISummary1['Hint']
  Quiz: RawSummary1Quiz[]
}

interface RawHintResponse {
  Type: IHint['Type']
  Hint: IHint['Hint']
  TryHint: IHint['TryHint']
  ErrorNo: IHint['ErrorNo']
}

interface RawSummary2Quiz extends RawQuizId {
  Examples: { Text: ISummary2Example['Text'] }[]
}

interface RawSummary2 extends RawQuizMetaBase {
  Sentence: ISummary2['Sentence']
  Quiz: RawSummary2Quiz[]
}

// summary1
async function getSummary1(study: IQuizStudyRef): Promise<ISummary1> {
  const { bookType, studyId, studentHistoryId } = study
  const typeName = 'summary-1'
  const path = `${GET_QUIZ_DATA_PATH}/${typeName}?studentHistoryId=${studentHistoryId}&studyId=${studyId}&bookType=${bookType}`

  const transformObject = async (raw: RawSummary1): Promise<ISummary1> => {
    return {
      ...mapQuizMetaBase(raw),
      IsEnablePenaltyReview: Boolean(raw.IsEnablePenaltyReview),
      Hint: {
        IsEnabled: raw.Hint.IsEnabled,
        Max: raw.Hint.Max,
        Try: raw.Hint.Try,
      },
      Quiz: raw.Quiz.map((q): ISummary1Quiz => {
        return {
          ...mapQuizId(q),
          Question: {
            Text: q.Question.Text,
            Sound: q.Question.Sound,
          },
        }
      }),
    }
  }
  return getQuizData<ISummary1>(path, transformObject)
}
// summary1 end

// summary hint
async function getSummaryHint(
  studyId: string,
  studentHistoryId: string,
  quizNo?: number,
  step?: string,
): Promise<IHint> {
  const path = `${GET_HINT_PATH}/Summary?studentHistoryId=${studentHistoryId}&studyId=${studyId}&quizNo=${quizNo}&step=${step}`
  const transformType = async (raw: RawHintResponse): Promise<IHint> => {
    return {
      Type: raw.Type,
      Hint: raw.Hint,
      TryHint: raw.TryHint,
      ErrorNo: raw.ErrorNo,
    }
  }
  return getQuizData<IHint>(path, transformType)
}
// summary hint end

// summary2
async function getSummary2(study: IQuizStudyRef): Promise<ISummary2> {
  const { bookType, studyId, studentHistoryId } = study
  const typeName = 'summary-2'
  const path = `${GET_QUIZ_DATA_PATH}/${typeName}?studentHistoryId=${studentHistoryId}&studyId=${studyId}&bookType=${bookType}`

  const transformObject = async (raw: RawSummary2): Promise<ISummary2> => {
    return {
      ...mapQuizMetaBase(raw),
      Sentence: {
        Texts: raw.Sentence.Texts,
        Sounds: raw.Sentence.Sounds,
      },
      Quiz: raw.Quiz.map((q): ISummary2Quiz => {
        return {
          ...mapQuizId(q),
          Examples: q.Examples.map(
            (e): ISummary2Example => ({ Text: e.Text }),
          ),
        }
      }),
    }
  }
  return getQuizData<ISummary2>(path, transformObject)
}

export { getSummary1, getSummary2, getSummaryHint }
