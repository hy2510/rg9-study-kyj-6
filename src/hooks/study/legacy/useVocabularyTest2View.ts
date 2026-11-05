import { useCallback, useMemo } from 'react'

import shuffle from 'lodash/shuffle'

import { IRecordAnswerType } from '@src/interfaces/common/Common'
import { Mode } from '@src/interfaces/common/Types'
import {
  IVocabulary2Example,
  IVocabulary2Test,
} from '@src/interfaces/study/IVocabulary'
import { calcStartPosition } from '@src/utils/study/legacy/calcStartPosition'

type UseVocabularyTest2ViewArgs = {
  quizData: IVocabulary2Test | undefined
  recordedData: IRecordAnswerType[]
  studyMode: Mode
}

export type VocabularyTest2QuizMeta = {
  quizId: string
  quizNo: number
  image: string
  sentence: string
  sound: string
  correctText: string
  examples: IVocabulary2Example[]
}

export type VocabularyTest2View = {
  isReady: boolean
  totalQuiz: number
  quizAnswerCount: number
  startQuizNo: number
  startTryCount: number
  getQuizMeta: (quizIndex: number) => VocabularyTest2QuizMeta | null
}

export function useVocabularyTest2View({
  quizData,
  recordedData,
  studyMode,
}: UseVocabularyTest2ViewArgs): VocabularyTest2View {
  const [startQuizNo, startTryCount] = useMemo<[number, number]>(() => {
    if (!quizData) return [1, 0]
    return calcStartPosition(studyMode, recordedData, quizData.QuizAnswerCount)
  }, [quizData, recordedData, studyMode])

  const quizMetaMap = useMemo<Map<number, VocabularyTest2QuizMeta>>(() => {
    const map = new Map<number, VocabularyTest2QuizMeta>()
    if (!quizData) return map
    const orderedQuizzes = [...quizData.Quiz].sort(
      (a, b) => a.QuizNo - b.QuizNo,
    )
    orderedQuizzes.forEach((q, idx) => {
      map.set(idx + 1, {
        quizId: q.QuizId,
        quizNo: q.QuizNo,
        image: q.Question.Image,
        sentence: q.Question.Text,
        sound: q.Question.Sound,
        correctText: q.Examples[0]?.Text ?? '',
        examples:
          (studyMode === 'student' || studyMode === 'guide' || studyMode === 'trial') ? shuffle([...q.Examples]) : q.Examples,
      })
    })
    return map
  }, [quizData, studyMode])

  const getQuizMeta = useCallback(
    (quizIndex: number): VocabularyTest2QuizMeta | null =>
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
