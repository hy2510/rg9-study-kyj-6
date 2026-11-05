import { useCallback, useMemo } from 'react'

import { IRecordAnswerType } from '@src/interfaces/common/Common'
import { Mode } from '@src/interfaces/common/Types'
import { IVocabulary3Test } from '@src/interfaces/study/IVocabulary'
import { calcStartPosition } from '@src/utils/study/legacy/calcStartPosition'
import {
  pickMainMean,
  pickSubMean,
} from '@src/utils/study/legacy/vocaMeanUtils'

type UseVocabularyTest3ViewArgs = {
  quizData: IVocabulary3Test | undefined
  recordedData: IRecordAnswerType[]
  studyMode: Mode
}

import { LegacyPenaltyState } from '@interfaces/study/legacy/legacyTypes'

export type VocabularyTest3PenaltyState = LegacyPenaltyState

export type VocabularyTest3QuizMeta = {
  quizId: string
  quizNo: number
  correctText: string
  sound: string
  speechPart: string
  mainMean: string
  subMean: string
}

export type VocabularyTest3InitialState = {
  startQuizNo: number
  startTryCount: number
  startPenaltyState: VocabularyTest3PenaltyState
}

export type VocabularyTest3View = {
  isReady: boolean
  totalQuiz: number
  quizAnswerCount: number
  isEnabledPenalty: boolean
  initial: VocabularyTest3InitialState
  getQuizMeta: (quizIndex: number) => VocabularyTest3QuizMeta | null
}

export function useVocabularyTest3View({
  quizData,
  recordedData,
  studyMode,
}: UseVocabularyTest3ViewArgs): VocabularyTest3View {
  const initial = useMemo<VocabularyTest3InitialState>(() => {
    if (!quizData) {
      return { startQuizNo: 1, startTryCount: 0, startPenaltyState: 'none' }
    }

    const [calcQuizNo, calcTryCnt] = calcStartPosition(
      studyMode,
      recordedData,
      quizData.QuizAnswerCount,
    )

    if (studyMode !== 'student' || recordedData.length === 0) {
      return {
        startQuizNo: calcQuizNo,
        startTryCount: calcTryCnt,
        startPenaltyState: 'none',
      }
    }

    const last = recordedData[recordedData.length - 1]

    if (quizData.IsEnablePenaltyReview && last.PenaltyWord !== '') {
      return {
        startQuizNo: last.CurrentQuizNo,
        startTryCount: quizData.QuizAnswerCount,
        startPenaltyState: 'penalty',
      }
    }

    return {
      startQuizNo: calcQuizNo,
      startTryCount: calcTryCnt,
      startPenaltyState: 'none',
    }
  }, [quizData, recordedData, studyMode])

  const quizMetaMap = useMemo<Map<number, VocabularyTest3QuizMeta>>(() => {
    const map = new Map<number, VocabularyTest3QuizMeta>()
    if (!quizData) return map
    const orderedQuizzes = [...quizData.Quiz].sort(
      (a, b) => a.QuizNo - b.QuizNo,
    )
    orderedQuizzes.forEach((q, idx) => {
      map.set(idx + 1, {
        quizId: q.QuizId,
        quizNo: q.QuizNo,
        correctText: q.Question.Text,
        sound: q.Question.Sound,
        speechPart: q.Question.SpeechPart,
        mainMean: pickMainMean(q.Question, quizData.MainMeanLanguage),
        subMean: pickSubMean(q.Question, quizData.SubMeanLanguage),
      })
    })
    return map
  }, [quizData])

  const getQuizMeta = useCallback(
    (quizIndex: number): VocabularyTest3QuizMeta | null =>
      quizMetaMap.get(quizIndex) ?? null,
    [quizMetaMap],
  )

  return {
    isReady: !!quizData,
    totalQuiz: quizData ? quizData.Quiz.length : 0,
    quizAnswerCount: quizData?.QuizAnswerCount ?? 0,
    isEnabledPenalty: !!quizData?.IsEnablePenaltyReview,
    initial,
    getQuizMeta,
  }
}
