import { useCallback, useMemo } from 'react'

import shuffle from 'lodash/shuffle'

import { IRecordAnswerType } from '@src/interfaces/common/Common'
import { Mode } from '@src/interfaces/common/Types'
import {
  IReadingComprehension3,
  IReadingComprehension3Example,
} from '@src/interfaces/study/IReadingComprehension'
import { calcStartPositionByIndex } from '@src/utils/study/legacy/calcStartPositionByIndex'

type UseReadingComprehension3ViewArgs = {
  quizData: IReadingComprehension3 | undefined
  recordedData: IRecordAnswerType[]
  studyMode: Mode
}

export type ReadingComprehension3QuizMeta = {
  quizId: string
  quizNo: number
  image: string
  questionText: string
  questionSound: string
  correctText: string
  examples: IReadingComprehension3Example[]
}

export type ReadingComprehension3View = {
  isReady: boolean
  totalQuiz: number
  quizAnswerCount: number
  startQuizNo: number
  startTryCount: number
  getQuizMeta: (quizIndex: number) => ReadingComprehension3QuizMeta | null
}

export function useReadingComprehension3View({
  quizData,
  recordedData,
  studyMode,
}: UseReadingComprehension3ViewArgs): ReadingComprehension3View {
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
    Map<number, ReadingComprehension3QuizMeta>
  >(() => {
    const map = new Map<number, ReadingComprehension3QuizMeta>()
    if (!quizData) return map
    quizData.Quiz.forEach((q, idx) => {
      map.set(idx + 1, {
        quizId: q.QuizId,
        quizNo: q.QuizNo,
        image: q.Question.Image,
        questionText: q.Question.Text,
        questionSound: q.Question.Sound,
        correctText: q.Examples[0]?.Text ?? '',
        examples:
          (studyMode === 'student' || studyMode === 'guide' || studyMode === 'trial') ? shuffle([...q.Examples]) : q.Examples,
      })
    })
    return map
  }, [quizData, studyMode])

  const getQuizMeta = useCallback(
    (quizIndex: number): ReadingComprehension3QuizMeta | null =>
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
