import { useCallback, useMemo } from 'react'

import {
  ClozeInputValue,
  LegacyPenaltyState,
} from '@interfaces/study/legacy/legacyTypes'
import { IRecordAnswerType } from '@src/interfaces/common/Common'
import { Mode } from '@src/interfaces/common/Types'
import {
  IClozeTest3,
  IClozeTest3Example,
} from '@src/interfaces/study/IClozeTest'
import { calcStartPosition } from '@src/utils/study/legacy/calcStartPosition'
import { buildEmptyInputs } from '@src/utils/study/legacy/clozeTestUtils'

export type ClozeTest3InputValue = ClozeInputValue
export type ClozeTest3PenaltyState = LegacyPenaltyState

type UseClozeTest3ViewArgs = {
  quizData: IClozeTest3 | undefined
  recordedData: IRecordAnswerType[]
  studyMode: Mode
}

export type ClozeTest3QuizMeta = {
  quizId: string
  quizNo: number
  sentence: string
  filledSentence: string
  sound: string
  correctAnswers: string[]
  examples: IClozeTest3Example[]
}

export type ClozeTest3InitialState = {
  startQuizNo: number
  startTryCount: number
  startInputValues: ClozeTest3InputValue[]
  startPenaltyState: ClozeTest3PenaltyState
  startCurrentIndex: number
  /**
   * 각 blank 별 attempt 이력 (7th 호환).
   * 예: ['221', '1', '', '2'] → blank 0 은 세 번째 attempt 에 정답, blank 1 은 첫 시도 정답 등.
   * '1' 로 끝나면 잠긴 상태이며 이후 attempt 에서 append 하지 않는다.
   */
  startPerBlankHistory: string[]
}

export type ClozeTest3View = {
  isReady: boolean
  totalBlankCount: number
  totalQuiz: number
  quizAnswerCount: number
  isEnabledPenalty: boolean
  initial: ClozeTest3InitialState
  getQuizMeta: (quizNo: number) => ClozeTest3QuizMeta | null
  makeEmptyInputs: (quizNo: number) => ClozeTest3InputValue[]
}


export function useClozeTest3View({
  quizData,
  recordedData,
  studyMode,
}: UseClozeTest3ViewArgs): ClozeTest3View {
  const initial = useMemo<ClozeTest3InitialState>(() => {
    if (!quizData) {
      return {
        startQuizNo: 1,
        startTryCount: 0,
        startInputValues: [],
        startPenaltyState: 'none',
        startCurrentIndex: 0,
        startPerBlankHistory: [],
      }
    }

    const [calcQuizNo, calcTryCnt] = calcStartPosition(
      studyMode,
      recordedData,
      quizData.QuizAnswerCount,
    )

    if (studyMode !== 'student' || recordedData.length === 0) {
      const target = quizData.Quiz.find((q) => q.QuizNo === calcQuizNo)
      const examples = target?.Examples ?? []
      return {
        startQuizNo: calcQuizNo,
        startTryCount: calcTryCnt,
        startInputValues: examples.map(() => ({
          text: '',
          isCorrected: false,
        })),
        startPenaltyState: 'none',
        startCurrentIndex: 0,
        startPerBlankHistory: examples.map(() => ''),
      }
    }

    const last = recordedData[recordedData.length - 1]

    if (quizData.IsEnablePenaltyReview && last.PenaltyWord !== '') {
      const penaltyQuizNo = last.CurrentQuizNo
      const target = quizData.Quiz.find((q) => q.QuizNo === penaltyQuizNo)
      const examples = target?.Examples ?? []
      return {
        startQuizNo: penaltyQuizNo,
        startTryCount: quizData.QuizAnswerCount,
        startInputValues: examples.map(() => ({
          text: '',
          isCorrected: false,
        })),
        startPenaltyState: 'penalty',
        startCurrentIndex: 0,
        startPerBlankHistory: examples.map(() => ''),
      }
    }

    const sameQuizRecord = recordedData[calcQuizNo - 1]
    const target = quizData.Quiz.find((q) => q.QuizNo === calcQuizNo)
    const examples = target?.Examples ?? []
    if (
      sameQuizRecord &&
      sameQuizRecord.CurrentQuizNo === calcQuizNo &&
      sameQuizRecord.StudentAnswer !== ''
    ) {
      const slices = last.StudentAnswer.split('/')
      const inputs: ClozeTest3InputValue[] = examples.map((ex, i) => {
        const slice = slices[i] ?? ''
        const isCorrected = slice.slice(-1) === '1'
        return {
          text: isCorrected ? ex.Text : '',
          isCorrected,
        }
      })
      const firstUnsolved = inputs.findIndex((v) => !v.isCorrected)
      return {
        startQuizNo: calcQuizNo,
        startTryCount: calcTryCnt,
        startInputValues: inputs,
        startPenaltyState: 'none',
        startCurrentIndex: firstUnsolved === -1 ? 0 : firstUnsolved,
        startPerBlankHistory: examples.map((_, i) => slices[i] ?? ''),
      }
    }

    return {
      startQuizNo: calcQuizNo,
      startTryCount: calcTryCnt,
      startInputValues: examples.map(() => ({ text: '', isCorrected: false })),
      startPenaltyState: 'none',
      startCurrentIndex: 0,
      startPerBlankHistory: examples.map(() => ''),
    }
  }, [quizData, recordedData, studyMode])

  const getQuizMeta = useCallback(
    (quizNo: number): ClozeTest3QuizMeta | null => {
      if (!quizData) return null
      const q = quizData.Quiz.find((quiz) => quiz.QuizNo === quizNo)
      if (!q) return null
      const correctAnswers = q.Examples.map((e) => e.Text)
      const sentenceParts = q.Question.Text.split('┒')
      let filledSentence = sentenceParts[0]
      for (let i = 1; i < sentenceParts.length; i++) {
        filledSentence += (correctAnswers[i - 1] ?? '') + sentenceParts[i]
      }
      return {
        quizId: q.QuizId,
        quizNo: q.QuizNo,
        sentence: q.Question.Text,
        filledSentence,
        sound: q.Question.Sound,
        correctAnswers,
        examples: q.Examples,
      }
    },
    [quizData],
  )

  const makeEmptyInputs = useCallback(
    (quizNo: number): ClozeTest3InputValue[] => {
      if (!quizData) return []
      const q = quizData.Quiz.find((quiz) => quiz.QuizNo === quizNo)
      if (!q) return []
      return buildEmptyInputs(q.Examples)
    },
    [quizData],
  )

  const totalBlankCount = useMemo<number>(() => {
    if (!quizData) return 0
    return quizData.Quiz.reduce((acc, q) => acc + q.Examples.length, 0)
  }, [quizData])

  return {
    isReady: !!quizData,
    totalBlankCount,
    totalQuiz: quizData ? quizData.Quiz.length : 0,
    quizAnswerCount: quizData?.QuizAnswerCount ?? 0,
    isEnabledPenalty: !!quizData?.IsEnablePenaltyReview,
    initial,
    getQuizMeta,
    makeEmptyInputs,
  }
}
