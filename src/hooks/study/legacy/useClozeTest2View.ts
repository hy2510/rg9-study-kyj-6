import { useCallback, useMemo } from 'react'

import {
  ClozeInputValue,
  LegacyPenaltyState,
} from '@interfaces/study/legacy/legacyTypes'
import { IRecordAnswerType } from '@src/interfaces/common/Common'
import { Mode } from '@src/interfaces/common/Types'
import {
  IClozeTest2,
  IClozeTest2Example,
} from '@src/interfaces/study/IClozeTest'
import { calcStartPosition } from '@src/utils/study/legacy/calcStartPosition'
import { buildEmptyInputs } from '@src/utils/study/legacy/clozeTestUtils'

export type ClozeTest2InputValue = ClozeInputValue
export type ClozeTest2PenaltyState = LegacyPenaltyState

type UseClozeTest2ViewArgs = {
  quizData: IClozeTest2 | undefined
  recordedData: IRecordAnswerType[]
  studyMode: Mode
}

export type ClozeTest2QuizMeta = {
  quizId: string
  quizNo: number
  sentence: string
  filledSentence: string
  sound: string
  correctAnswers: string[]
  examples: IClozeTest2Example[]
}

export type ClozeTest2InitialState = {
  startQuizNo: number
  startTryCount: number
  startInputValues: ClozeTest2InputValue[]
  startPenaltyState: ClozeTest2PenaltyState
  startCurrentIndex: number
}

export type ClozeTest2View = {
  isReady: boolean
  totalQuiz: number
  quizAnswerCount: number
  isEnabledPenalty: boolean
  initial: ClozeTest2InitialState
  getQuizMeta: (quizNo: number) => ClozeTest2QuizMeta | null
  makeEmptyInputs: (quizNo: number) => ClozeTest2InputValue[]
}

function restoreInputsFromRecord(
  studentAnswer: string,
  examples: IClozeTest2Example[],
): ClozeTest2InputValue[] {
  const slices = studentAnswer.split('┒')
  const result: ClozeTest2InputValue[] = []
  for (let i = 0; i < examples.length; i++) {
    const slice = slices[i] ?? ''
    const isCorrected = slice.slice(-1) === '1' || slice === examples[i].Text
    result.push({
      text: isCorrected ? examples[i].Text : '',
      isCorrected,
    })
  }
  return result
}

export function useClozeTest2View({
  quizData,
  recordedData,
  studyMode,
}: UseClozeTest2ViewArgs): ClozeTest2View {
  const initial = useMemo<ClozeTest2InitialState>(() => {
    if (!quizData) {
      return {
        startQuizNo: 1,
        startTryCount: 0,
        startInputValues: [],
        startPenaltyState: 'none',
        startCurrentIndex: 0,
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
      const inputs = restoreInputsFromRecord(
        recordedData[recordedData.length - 1].StudentAnswer,
        examples,
      )
      const firstUnsolved = inputs.findIndex((v) => !v.isCorrected)
      return {
        startQuizNo: calcQuizNo,
        startTryCount: calcTryCnt,
        startInputValues: inputs,
        startPenaltyState: 'none',
        startCurrentIndex: firstUnsolved === -1 ? 0 : firstUnsolved,
      }
    }

    return {
      startQuizNo: calcQuizNo,
      startTryCount: calcTryCnt,
      startInputValues: examples.map(() => ({ text: '', isCorrected: false })),
      startPenaltyState: 'none',
      startCurrentIndex: 0,
    }
  }, [quizData, recordedData, studyMode])

  const getQuizMeta = useCallback(
    (quizNo: number): ClozeTest2QuizMeta | null => {
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
    (quizNo: number): ClozeTest2InputValue[] => {
      if (!quizData) return []
      const q = quizData.Quiz.find((quiz) => quiz.QuizNo === quizNo)
      if (!q) return []
      return buildEmptyInputs(q.Examples)
    },
    [quizData],
  )

  return {
    isReady: !!quizData,
    totalQuiz: quizData ? quizData.Quiz.length : 0,
    quizAnswerCount: quizData?.QuizAnswerCount ?? 0,
    isEnabledPenalty: !!quizData?.IsEnablePenaltyReview,
    initial,
    getQuizMeta,
    makeEmptyInputs,
  }
}
