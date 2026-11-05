import { useCallback, useMemo } from 'react'

import shuffle from 'lodash/shuffle'

import { IRecordAnswerType } from '@src/interfaces/common/Common'
import { Mode } from '@src/interfaces/common/Types'
import {
  IReadingComprehension2,
  IReadingComprehension2Example,
} from '@src/interfaces/study/IReadingComprehension'
import { calcStartPositionByIndex } from '@src/utils/study/legacy/calcStartPositionByIndex'

type UseReadingComprehension2ViewArgs = {
  quizData: IReadingComprehension2 | undefined
  recordedData: IRecordAnswerType[]
  studyMode: Mode
}

export type ReadingComprehension2QuizMeta = {
  quizId: string
  quizNo: number
  image: string
  correctText: string
  examples: IReadingComprehension2Example[]
}

export type ReadingComprehension2View = {
  isReady: boolean
  totalQuiz: number
  quizAnswerCount: number
  startQuizNo: number
  startTryCount: number
  getQuizMeta: (quizIndex: number) => ReadingComprehension2QuizMeta | null
}

export function useReadingComprehension2View({
  quizData,
  recordedData,
  studyMode,
}: UseReadingComprehension2ViewArgs): ReadingComprehension2View {
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
    Map<number, ReadingComprehension2QuizMeta>
  >(() => {
    const map = new Map<number, ReadingComprehension2QuizMeta>()
    if (!quizData) return map
    quizData.Quiz.forEach((q, idx) => {
      map.set(idx + 1, {
        quizId: q.QuizId,
        quizNo: q.QuizNo,
        image: q.Question.Image,
        correctText: q.Question.Text,
        examples:
          (studyMode === 'student' || studyMode === 'guide' || studyMode === 'trial') ? shuffle([...q.Examples]) : q.Examples,
      })
    })
    return map
  }, [quizData, studyMode])

  const getQuizMeta = useCallback(
    (quizIndex: number): ReadingComprehension2QuizMeta | null =>
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
