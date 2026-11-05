import { useCallback, useMemo } from 'react'

import shuffle from 'lodash/shuffle'

import { IRecordAnswerType } from '@src/interfaces/common/Common'
import { Mode } from '@src/interfaces/common/Types'
import {
  IVocabulary1Example,
  IVocabulary1Test,
} from '@src/interfaces/study/IVocabulary'
import { calcStartPosition } from '@src/utils/study/legacy/calcStartPosition'

type UseVocabularyTest1ViewArgs = {
  quizData: IVocabulary1Test | undefined
  recordedData: IRecordAnswerType[]
  studyMode: Mode
}

export type VocabularyTest1QuizMeta = {
  quizId: string
  quizNo: number
  image: string
  sound: string
  correctText: string
  examples: IVocabulary1Example[]
}

export type VocabularyTest1View = {
  isReady: boolean
  totalQuiz: number
  quizAnswerCount: number
  startQuizNo: number
  startTryCount: number
  getQuizMeta: (quizIndex: number) => VocabularyTest1QuizMeta | null
}

export function useVocabularyTest1View({
  quizData,
  recordedData,
  studyMode,
}: UseVocabularyTest1ViewArgs): VocabularyTest1View {
  const [startQuizNo, startTryCount] = useMemo<[number, number]>(() => {
    if (!quizData) return [1, 0]
    return calcStartPosition(studyMode, recordedData, quizData.QuizAnswerCount)
  }, [quizData, recordedData, studyMode])

  const quizMetaMap = useMemo<Map<number, VocabularyTest1QuizMeta>>(() => {
    const map = new Map<number, VocabularyTest1QuizMeta>()
    if (!quizData) return map
    const orderedQuizzes = [...quizData.Quiz].sort(
      (a, b) => a.QuizNo - b.QuizNo,
    )
    orderedQuizzes.forEach((q, idx) => {
      map.set(idx + 1, {
        quizId: q.QuizId,
        quizNo: q.QuizNo,
        image: q.Question.Image,
        sound: q.Question.Sound,
        correctText: q.Question.Text,
        examples:
          (studyMode === 'student' || studyMode === 'guide' || studyMode === 'trial') ? shuffle([...q.Examples]) : q.Examples,
      })
    })
    return map
  }, [quizData, studyMode])

  const getQuizMeta = useCallback(
    (quizIndex: number): VocabularyTest1QuizMeta | null =>
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
