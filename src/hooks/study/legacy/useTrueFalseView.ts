import { useCallback, useMemo } from 'react'

import { IRecordAnswerType } from '@src/interfaces/common/Common'
import { Mode } from '@src/interfaces/common/Types'
import {
  ITrueOrFalse,
  ITrueOrFalseExample,
} from '@src/interfaces/study/ITrueOrFalse'
import { calcStartPositionByIndex } from '@src/utils/study/legacy/calcStartPositionByIndex'

type UseTrueFalseViewArgs = {
  quizData: ITrueOrFalse | undefined
  recordedData: IRecordAnswerType[]
  studyMode: Mode
}

export type TrueFalseQuizMeta = {
  quizId: string
  quizNo: number
  questionText: string
  isQuestionTrue: boolean
  questionSound: string
  trueSentenceText: string
  trueSentenceSound: string
  examples: ITrueOrFalseExample[]
}

export type TrueFalseView = {
  isReady: boolean
  totalQuiz: number
  quizAnswerCount: number
  startQuizNo: number
  startTryCount: number
  getQuizMeta: (quizIndex: number) => TrueFalseQuizMeta | null
}

export function useTrueFalseView({
  quizData,
  recordedData,
  studyMode,
}: UseTrueFalseViewArgs): TrueFalseView {
  const [startQuizNo, startTryCount] = useMemo<[number, number]>(() => {
    if (!quizData) return [1, 0]
    return calcStartPositionByIndex(
      studyMode,
      recordedData,
      quizData.Quiz,
      quizData.QuizAnswerCount,
    )
  }, [quizData, recordedData, studyMode])

  const getQuizMeta = useCallback(
    (quizIndex: number): TrueFalseQuizMeta | null => {
      if (!quizData) return null
      const q = quizData.Quiz[quizIndex - 1]
      if (!q) return null
      const trueSentence = q.Examples[0]
      return {
        quizId: q.QuizId,
        quizNo: q.QuizNo,
        questionText: q.Question.Text,
        isQuestionTrue: q.Question.Text === trueSentence?.Text,
        questionSound: q.Question.Sound,
        trueSentenceText: trueSentence?.Text ?? '',
        trueSentenceSound: trueSentence?.Sound ?? '',
        examples: q.Examples,
      }
    },
    [quizData],
  )

  return {
    isReady: !!quizData,
    totalQuiz: quizData ? quizData.Quiz.length : 0,
    quizAnswerCount: quizData?.QuizAnswerCount ?? 0,
    startQuizNo,
    startTryCount,
    getQuizMeta,
  }
}
