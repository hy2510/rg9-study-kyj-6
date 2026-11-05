import { useMemo } from 'react'

import { IRecordAnswerType } from '@src/interfaces/common/Common'
import { Mode } from '@src/interfaces/common/Types'
import {
  ISummary1,
  ISummary1Hint,
  ISummary1Quiz,
} from '@src/interfaces/study/ISummary'
import { calcStartPosition } from '@src/utils/study/legacy/calcStartPosition'

type UseSummary1ViewArgs = {
  quizData: ISummary1 | undefined
  recordedData: IRecordAnswerType[]
  studyMode: Mode
}

export type Summary1QuizMeta = {
  quizId: string
  quizNo: number
  text: string
  sound: string
}

export type Summary1PenaltyState = 'none' | 'penalty'

export type Summary1View = {
  isReady: boolean
  totalQuiz: number
  quizAnswerCount: number
  orderedQuizzes: Summary1QuizMeta[]
  soundUrlsOrdered: string[]
  startQuizNo: number
  startTryCount: number
  startPenaltyState: Summary1PenaltyState
  isEnablePenaltyReview: boolean
  hint: ISummary1Hint
}

export function useSummary1View({
  quizData,
  recordedData,
  studyMode,
}: UseSummary1ViewArgs): Summary1View {
  const orderedQuizzes = useMemo<Summary1QuizMeta[]>(() => {
    if (!quizData) return []
    const cloned: ISummary1Quiz[] = [...quizData.Quiz].sort(
      (a, b) => a.QuizNo - b.QuizNo,
    )
    return cloned.map((q) => ({
      quizId: q.QuizId,
      quizNo: q.QuizNo,
      text: q.Question.Text,
      sound: q.Question.Sound,
    }))
  }, [quizData])

  const soundUrlsOrdered = useMemo<string[]>(
    () => orderedQuizzes.map((q) => (q.sound ?? '').trim()),
    [orderedQuizzes],
  )

  const [startQuizNo, startTryCount, startPenaltyState] = useMemo<
    [number, number, Summary1PenaltyState]
  >(() => {
    if (!quizData) return [1, 0, 'none']

    if (
      studyMode === 'student' &&
      recordedData.length > 0 &&
      quizData.IsEnablePenaltyReview
    ) {
      const last = recordedData[recordedData.length - 1]
      if (last.PenaltyWord !== '') {
        return [last.CurrentQuizNo, quizData.QuizAnswerCount, 'penalty']
      }
    }

    const [start, tryCnt] = calcStartPosition(
      studyMode,
      recordedData,
      quizData.QuizAnswerCount,
    )
    return [start, tryCnt, 'none']
  }, [quizData, recordedData, studyMode])

  return {
    isReady: !!quizData,
    totalQuiz: quizData ? quizData.Quiz.length : 0,
    quizAnswerCount: quizData?.QuizAnswerCount ?? 0,
    orderedQuizzes,
    soundUrlsOrdered,
    startQuizNo,
    startTryCount,
    startPenaltyState,
    isEnablePenaltyReview: !!quizData?.IsEnablePenaltyReview,
    hint: quizData?.Hint ?? { IsEnabled: false, Max: 0, Try: 0 },
  }
}
