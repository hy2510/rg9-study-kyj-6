import { useCallback, useMemo } from 'react'

import shuffle from 'lodash/shuffle'

import { IRecordAnswerType } from '@src/interfaces/common/Common'
import { Mode } from '@src/interfaces/common/Types'
import {
  IReadingComprehension4,
  IReadingComprehension4Example,
} from '@src/interfaces/study/IReadingComprehension'
import { calcStartPosition } from '@src/utils/study/legacy/calcStartPosition'

type UseReadingComprehension4ViewArgs = {
  quizData: IReadingComprehension4 | undefined
  recordedData: IRecordAnswerType[]
  studyMode: Mode
}

export type ReadingComprehension4QuizMeta = {
  quizId: string
  quizNo: number
  questionText: string
  correctText: string
  sound: string
  examples: IReadingComprehension4Example[]
}

export type ReadingComprehension4View = {
  isReady: boolean
  totalQuiz: number
  quizAnswerCount: number
  startQuizNo: number
  startTryCount: number
  isHideQuestionText: boolean
  getQuizMeta: (quizIndex: number) => ReadingComprehension4QuizMeta | null
}

export function useReadingComprehension4View({
  quizData,
  recordedData,
  studyMode,
}: UseReadingComprehension4ViewArgs): ReadingComprehension4View {
  const sortedQuiz = useMemo(() => {
    if (!quizData) return []
    return [...quizData.Quiz].sort(
      (a, b) => Number(a.QuizNo) - Number(b.QuizNo),
    )
  }, [quizData])

  const [startQuizNo, startTryCount] = useMemo<[number, number]>(() => {
    if (!quizData) return [1, 0]
    return calcStartPosition(studyMode, recordedData, quizData.QuizAnswerCount)
  }, [quizData, recordedData, studyMode])

  const quizMetaMap = useMemo<
    Map<number, ReadingComprehension4QuizMeta>
  >(() => {
    const map = new Map<number, ReadingComprehension4QuizMeta>()
    sortedQuiz.forEach((q, idx) => {
      map.set(idx + 1, {
        quizId: q.QuizId,
        quizNo: q.QuizNo,
        questionText: q.Question.Text,
        correctText: q.Examples[0]?.Text ?? '',
        sound: q.Question.Sound ?? '',
        examples:
          (studyMode === 'student' || studyMode === 'guide' || studyMode === 'trial') ? shuffle([...q.Examples]) : q.Examples,
      })
    })
    return map
  }, [sortedQuiz, studyMode])

  const getQuizMeta = useCallback(
    (quizIndex: number): ReadingComprehension4QuizMeta | null =>
      quizMetaMap.get(quizIndex) ?? null,
    [quizMetaMap],
  )

  return {
    isReady: !!quizData,
    totalQuiz: sortedQuiz.length,
    quizAnswerCount: quizData?.QuizAnswerCount ?? 0,
    startQuizNo,
    startTryCount,
    isHideQuestionText: quizData?.IsHideQuestionText ?? false,
    getQuizMeta,
  }
}
