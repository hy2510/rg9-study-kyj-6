import { useCallback, useMemo } from 'react'

import shuffle from 'lodash/shuffle'

import { IRecordAnswerType } from '@src/interfaces/common/Common'
import { Mode } from '@src/interfaces/common/Types'
import {
  IListeningActivity3,
  IListeningActivity3Example,
} from '@src/interfaces/study/IListeningActivity'
import { calcStartPosition } from '@src/utils/study/legacy/calcStartPosition'

type UseListeningActivity3ViewArgs = {
  quizData: IListeningActivity3 | undefined
  recordedData: IRecordAnswerType[]
  studyMode: Mode
}

export type ListeningActivity3QuizMeta = {
  quizId: string
  quizNo: number
  correctText: string
  sound: string
  examples: IListeningActivity3Example[]
}

export type ListeningActivity3View = {
  isReady: boolean
  totalQuiz: number
  quizAnswerCount: number
  startQuizNo: number
  startTryCount: number
  getQuizMeta: (quizIndex: number) => ListeningActivity3QuizMeta | null
}

export function useListeningActivity3View({
  quizData,
  recordedData,
  studyMode,
}: UseListeningActivity3ViewArgs): ListeningActivity3View {
  const [startQuizNo, startTryCount] = useMemo<[number, number]>(() => {
    if (!quizData) return [1, 0]
    return calcStartPosition(
      studyMode,
      recordedData,
      quizData.QuizAnswerCount,
    )
  }, [quizData, recordedData, studyMode])

  const quizMetaMap = useMemo<Map<number, ListeningActivity3QuizMeta>>(() => {
    const map = new Map<number, ListeningActivity3QuizMeta>()
    if (!quizData) return map
    quizData.Quiz.forEach((q, idx) => {
      map.set(idx + 1, {
        quizId: q.QuizId,
        quizNo: q.QuizNo,
        correctText: q.Question.Text,
        sound: q.Question.Sound,
        examples:
          (studyMode === 'student' || studyMode === 'guide' || studyMode === 'trial') ? shuffle([...q.Examples]) : q.Examples,
      })
    })
    return map
  }, [quizData, studyMode])

  const getQuizMeta = useCallback(
    (quizIndex: number): ListeningActivity3QuizMeta | null =>
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
