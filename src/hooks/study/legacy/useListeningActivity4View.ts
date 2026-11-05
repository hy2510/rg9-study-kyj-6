import { useCallback, useMemo } from 'react'

import shuffle from 'lodash/shuffle'

import { IRecordAnswerType } from '@src/interfaces/common/Common'
import { Mode } from '@src/interfaces/common/Types'
import {
  IListeningActivity4,
  IListeningActivity4Example,
} from '@src/interfaces/study/IListeningActivity'
import { calcStartPosition } from '@src/utils/study/legacy/calcStartPosition'

type UseListeningActivity4ViewArgs = {
  quizData: IListeningActivity4 | undefined
  recordedData: IRecordAnswerType[]
  studyMode: Mode
}

export type ListeningActivity4QuizMeta = {
  quizId: string
  quizNo: number
  image: string
  correctText: string
  examples: IListeningActivity4Example[]
}

export type ListeningActivity4View = {
  isReady: boolean
  totalQuiz: number
  quizAnswerCount: number
  startQuizNo: number
  startTryCount: number
  getQuizMeta: (quizIndex: number) => ListeningActivity4QuizMeta | null
}

export function useListeningActivity4View({
  quizData,
  recordedData,
  studyMode,
}: UseListeningActivity4ViewArgs): ListeningActivity4View {
  const [startQuizNo, startTryCount] = useMemo<[number, number]>(() => {
    if (!quizData) return [1, 0]
    return calcStartPosition(studyMode, recordedData, quizData.QuizAnswerCount)
  }, [quizData, recordedData, studyMode])

  const quizMetaMap = useMemo<Map<number, ListeningActivity4QuizMeta>>(() => {
    const map = new Map<number, ListeningActivity4QuizMeta>()
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
    (quizIndex: number): ListeningActivity4QuizMeta | null =>
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
