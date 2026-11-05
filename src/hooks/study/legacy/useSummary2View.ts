import { useCallback, useMemo } from 'react'

import shuffle from 'lodash/shuffle'

import { Summary2FilledEntry } from '@interfaces/study/legacy/legacyTypes'
import { IRecordAnswerType } from '@src/interfaces/common/Common'
import { Mode } from '@src/interfaces/common/Types'
import {
  ISummary2,
  ISummary2Example,
  ISummary2Quiz,
  ISummary2Sentence,
} from '@src/interfaces/study/ISummary'

type UseSummary2ViewArgs = {
  quizData: ISummary2 | undefined
  recordedData: IRecordAnswerType[]
  studyMode: Mode
}

export type Summary2WordToken =
  | { kind: 'word'; text: string }
  | {
      kind: 'blank'
      questionIndex: number
      /** 빈칸 앞에 붙어있던 특수문자 (예: ',┒' → ',') */
      leadingText?: string
      /** 빈칸 뒤에 붙어있던 특수문자 (예: '┒.' → '.') */
      trailingText?: string
    }

export type Summary2SentenceShape = {
  lines: Array<{
    tokens: Summary2WordToken[]
  }>
  blankCount: number
}

export type Summary2QuizMeta = {
  quizId: string
  quizNo: number
  blankCount: number
  examples: ISummary2Example[]
}

export type Summary2InitialState = {
  startQuestionNo: number
  startQuizNo: number
  startTryCount: number
  startPartialRecord: string
  startTopExamples: ISummary2Example[]
  startBottomExamples: ISummary2Example[]
  startFilledTexts: Record<number, Summary2FilledEntry>
}

export type Summary2View = {
  isReady: boolean
  totalBlanks: number
  totalQuiz: number
  quizAnswerCount: number
  sentenceShape: Summary2SentenceShape
  exampleData: ISummary2Example[]
  sentenceSound: string
  initial: Summary2InitialState
  getQuizMeta: (quizNo: number) => Summary2QuizMeta | null
  questionNoToQuizNo: number[]
}

function calcStartPositionSummary2(
  studyMode: Mode,
  recordedData: IRecordAnswerType[],
  requireQuizCount: number,
  maxQuizCount: number,
): [number, number, number] {
  let currentQuizNo = 1
  let lastQuizNo = 1
  let tryCnt = 0

  if ((studyMode === 'student' || studyMode === 'guide' || studyMode === 'trial') && recordedData && recordedData.length > 0) {
    const last = recordedData[recordedData.length - 1]
    const userAnswers = last.StudentAnswer.split(',')
    const lastAnswer = userAnswers[userAnswers.length - 1].slice(-1)
    const lastAnswerLength = userAnswers[userAnswers.length - 1].length

    if (lastAnswerLength === maxQuizCount || lastAnswer === '1') {
      if (userAnswers.length === requireQuizCount) {
        lastQuizNo = last.QuizNo + 1
      } else {
        lastQuizNo = last.QuizNo
      }
      currentQuizNo = last.CurrentQuizNo + 1
    } else {
      currentQuizNo = last.CurrentQuizNo
      lastQuizNo = last.QuizNo
      tryCnt = lastAnswerLength
    }
  }

  return [currentQuizNo, lastQuizNo, tryCnt]
}

function restorePartialRecord(
  recordedData: IRecordAnswerType[],
  nextQuizNo: number,
  maxQuizCount: number,
): string {
  let partial = ''
  for (const record of recordedData) {
    if (record.QuizNo === nextQuizNo) {
      if (
        record.AnswerCount === maxQuizCount ||
        record.StudentAnswer.slice(-1) === '1'
      ) {
        partial = record.StudentAnswer + ','
      } else {
        partial = record.StudentAnswer
      }
    }
  }
  return partial
}

function buildSentenceShape(
  sentence: ISummary2Sentence,
  examples: ISummary2Example[],
): Summary2SentenceShape {
  let blankIdx = 0
  const lines = sentence.Texts.map((text) => {
    const words = text.split(' ')
    const tokens: Summary2WordToken[] = words.map((word) => {
      if (!word.includes('┒')) return { kind: 'word', text: word }

      // '┒' 에 인접한 특수문자(마침표, 쉼표, 아포스트로피 등)를 유실하지 않도록
      // prefix/suffix 를 blank 토큰에 함께 부착한다. 렌더 시 공백 없이 붙여서 출력.
      const match = word.match(/^([^┒]*)┒([^┒]*)$/)
      const leadingText = match?.[1] || undefined
      const trailingText = match?.[2] || undefined

      const questionIndex = blankIdx + 1
      blankIdx += 1
      return { kind: 'blank', questionIndex, leadingText, trailingText }
    })
    return { tokens }
  })
  return { lines, blankCount: examples.length || blankIdx }
}

function buildQuestionNoToQuizNo(quizzes: ISummary2Quiz[]): number[] {
  const arr: number[] = []
  for (const q of quizzes) {
    for (let i = 0; i < q.Examples.length; i++) {
      arr.push(q.QuizNo)
    }
  }
  return arr
}

function flattenExamples(quizzes: ISummary2Quiz[]): ISummary2Example[] {
  const out: ISummary2Example[] = []
  for (const q of quizzes) {
    for (const e of q.Examples) out.push(e)
  }
  return out
}

export function useSummary2View({
  quizData,
  recordedData,
  studyMode,
}: UseSummary2ViewArgs): Summary2View {
  const exampleData = useMemo<ISummary2Example[]>(
    () => (quizData ? flattenExamples(quizData.Quiz) : []),
    [quizData],
  )

  const sentenceShape = useMemo<Summary2SentenceShape>(() => {
    if (!quizData) return { lines: [], blankCount: 0 }
    return buildSentenceShape(quizData.Sentence, exampleData)
  }, [quizData, exampleData])

  const questionNoToQuizNo = useMemo<number[]>(
    () => (quizData ? buildQuestionNoToQuizNo(quizData.Quiz) : []),
    [quizData],
  )

  const initial = useMemo<Summary2InitialState>(() => {
    const empty: Summary2InitialState = {
      startQuestionNo: 1,
      startQuizNo: 1,
      startTryCount: 0,
      startPartialRecord: '',
      startTopExamples: [],
      startBottomExamples: [],
      startFilledTexts: {},
    }

    if (!quizData) return empty

    const requireQuizCount = (() => {
      if (recordedData.length === 0) return 0
      const lastQuizNo = recordedData[recordedData.length - 1].QuizNo
      const target = quizData.Quiz.find((q) => q.QuizNo === lastQuizNo)
      return target?.Examples.length ?? 0
    })()

    const [currentQuizNo, lastQuizNo, tryCnt] = calcStartPositionSummary2(
      studyMode,
      recordedData,
      requireQuizCount,
      quizData.QuizAnswerCount,
    )

    if (currentQuizNo > 1 || tryCnt > 0) {
      const qNoToQuizNo = buildQuestionNoToQuizNo(quizData.Quiz)
      const top = exampleData.slice(0, currentQuizNo - 1)
      const bottom = exampleData.slice(currentQuizNo - 1)
      const partial = restorePartialRecord(
        recordedData,
        lastQuizNo,
        quizData.QuizAnswerCount,
      )

      const prefilled: Record<number, Summary2FilledEntry> = {}
      for (let i = 0; i < top.length; i++) {
        const qNo = i + 1
        const quizNoForBlank = qNoToQuizNo[i]
        const posInQuiz = qNoToQuizNo.slice(0, i).filter((n) => n === quizNoForBlank).length
        const record = recordedData.find((r) => r.QuizNo === quizNoForBlank)
        let isCorrect = false
        if (record) {
          const blankHistory = record.StudentAnswer.split(',')[posInQuiz] ?? ''
          isCorrect = blankHistory.endsWith('1')
        }
        prefilled[qNo] = { text: top[i].Text, isCorrect }
      }

      const shouldShuffleOptions =
        (studyMode === 'student' || studyMode === 'guide' || studyMode === 'trial') || studyMode === 'review'
      return {
        startQuestionNo: currentQuizNo,
        startQuizNo: lastQuizNo,
        startTryCount: tryCnt,
        startPartialRecord: partial,
        startTopExamples: top,
        startBottomExamples: shouldShuffleOptions ? shuffle([...bottom]) : bottom,
        startFilledTexts: prefilled,
      }
    }

    const shouldShuffleOptions =
      (studyMode === 'student' || studyMode === 'guide' || studyMode === 'trial') || studyMode === 'review'
    return {
      ...empty,
      startBottomExamples: shouldShuffleOptions
        ? shuffle([...exampleData])
        : exampleData,
    }
  }, [quizData, recordedData, studyMode, exampleData])

  const getQuizMeta = useCallback(
    (quizNo: number): Summary2QuizMeta | null => {
      if (!quizData) return null
      const q = quizData.Quiz.find((quiz) => quiz.QuizNo === quizNo)
      if (!q) return null
      return {
        quizId: q.QuizId,
        quizNo: q.QuizNo,
        blankCount: q.Examples.length,
        examples: q.Examples,
      }
    },
    [quizData],
  )

  return {
    isReady: !!quizData,
    totalBlanks: exampleData.length,
    totalQuiz: quizData ? quizData.Quiz.length : 0,
    quizAnswerCount: quizData?.QuizAnswerCount ?? 0,
    sentenceShape,
    exampleData,
    sentenceSound: quizData?.Sentence.Sounds[0] ?? '',
    initial,
    getQuizMeta,
    questionNoToQuizNo,
  }
}
