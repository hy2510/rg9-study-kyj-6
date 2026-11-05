import { useCallback, useMemo } from 'react'

import shuffle from 'lodash/shuffle'

import { IRecordAnswerType } from '@src/interfaces/common/Common'
import { Mode } from '@src/interfaces/common/Types'
import {
  IReadingComprehension1,
  IReadingComprehension1Example,
} from '@src/interfaces/study/IReadingComprehension'
import { calcStartPositionByIndex } from '@src/utils/study/legacy/calcStartPositionByIndex'

type UseReadingComprehension1ViewArgs = {
  quizData: IReadingComprehension1 | undefined
  recordedData: IRecordAnswerType[]
  studyMode: Mode
}

export type ReadingComprehension1QuizMeta = {
  quizId: string
  quizNo: number
  questionText: string
  correctText: string
  sound: string
  examples: IReadingComprehension1Example[]
}

export type ReadingComprehension1View = {
  isReady: boolean
  totalQuiz: number
  quizAnswerCount: number
  startQuizNo: number
  startTryCount: number
  getQuizMeta: (quizIndex: number) => ReadingComprehension1QuizMeta | null
}

export function useReadingComprehension1View({
  quizData,
  recordedData,
  studyMode,
}: UseReadingComprehension1ViewArgs): ReadingComprehension1View {
  const [startQuizNo, startTryCount] = useMemo<[number, number]>(() => {
    if (!quizData) return [1, 0]
    return calcStartPositionByIndex(
      studyMode,
      recordedData,
      quizData.Quiz,
      quizData.QuizAnswerCount,
    )
  }, [quizData, recordedData, studyMode])

  const quizMetaMap = useMemo<
    Map<number, ReadingComprehension1QuizMeta>
  >(() => {
    const map = new Map<number, ReadingComprehension1QuizMeta>()
    if (!quizData) return map
    quizData.Quiz.forEach((q, idx) => {
      map.set(idx + 1, {
        quizId: q.QuizId,
        quizNo: q.QuizNo,
        questionText: q.Question.Text,
        correctText: q.Question.Text,
        sound: q.Question.Sound,
        examples:
          (studyMode === 'student' || studyMode === 'guide' || studyMode === 'trial') ? shuffle([...q.Examples]) : q.Examples,
      })
    })
    return map
  }, [quizData, studyMode])

  const getQuizMeta = useCallback(
    (quizIndex: number): ReadingComprehension1QuizMeta | null =>
      quizMetaMap.get(quizIndex) ?? null,
    [quizMetaMap],
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
