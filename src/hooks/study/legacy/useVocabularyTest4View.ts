import { useCallback, useMemo } from 'react'

import shuffle from 'lodash/shuffle'

import { IRecordAnswerType } from '@src/interfaces/common/Common'
import { Mode } from '@src/interfaces/common/Types'
import {
  IVocabulary4Example,
  IVocabulary4Test,
} from '@src/interfaces/study/IVocabulary'
import { calcStartPositionByIndex } from '@src/utils/study/legacy/calcStartPositionByIndex'
import {
  pickMainMean,
  pickSubMean,
} from '@src/utils/study/legacy/vocaMeanUtils'

type UseVocabularyTest4ViewArgs = {
  quizData: IVocabulary4Test | undefined
  recordedData: IRecordAnswerType[]
  studyMode: Mode
}

export type VocabularyTest4QuizMeta = {
  quizId: string
  quizNo: number
  mainMean: string
  subMean: string
  speechPart: string
  correctText: string
  examples: IVocabulary4Example[]
}

export type VocabularyTest4View = {
  isReady: boolean
  totalQuiz: number
  quizAnswerCount: number
  startQuizNo: number
  startTryCount: number
  getQuizMeta: (quizIndex: number) => VocabularyTest4QuizMeta | null
}

export function useVocabularyTest4View({
  quizData,
  recordedData,
  studyMode,
}: UseVocabularyTest4ViewArgs): VocabularyTest4View {
  const [startQuizNo, startTryCount] = useMemo<[number, number]>(() => {
    if (!quizData) return [1, 0]
    return calcStartPositionByIndex(
      studyMode,
      recordedData,
      quizData.Quiz,
      quizData.QuizAnswerCount,
    )
  }, [quizData, recordedData, studyMode])

  const quizMetaMap = useMemo<Map<number, VocabularyTest4QuizMeta>>(() => {
    const map = new Map<number, VocabularyTest4QuizMeta>()
    if (!quizData) return map
    const orderedQuizzes = [...quizData.Quiz].sort(
      (a, b) => a.QuizNo - b.QuizNo,
    )
    orderedQuizzes.forEach((q, idx) => {
      map.set(idx + 1, {
        quizId: q.QuizId,
        quizNo: q.QuizNo,
        mainMean: pickMainMean(q.Question, quizData.MainMeanLanguage),
        subMean: pickSubMean(q.Question, quizData.SubMeanLanguage),
        speechPart: q.Question.SpeechPart,
        correctText: q.Question.Text,
        examples:
          (studyMode === 'student' || studyMode === 'guide' || studyMode === 'trial') ? shuffle([...q.Examples]) : q.Examples,
      })
    })
    return map
  }, [quizData, studyMode])

  const getQuizMeta = useCallback(
    (quizIndex: number): VocabularyTest4QuizMeta | null =>
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
