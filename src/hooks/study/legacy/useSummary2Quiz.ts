import { useEffect, useRef, useState } from 'react'

import { useStudentAnswer } from '@hooks/study/legacy/useStudentAnswer'
import { Summary2FilledEntry } from '@interfaces/study/legacy/legacyTypes'
import { saveUserAnswerPartial } from '@services/studyApi'
import {
  IRecordAnswerType,
  IScoreBoardData,
} from '@src/interfaces/common/Common'
import { Mode } from '@src/interfaces/common/Types'
import { ISummary2Example } from '@src/interfaces/study/ISummary'
import { ILegacyStudyData } from '@src/interfaces/study/legacy/LegacyStudy'
import { captureFinishStudyInfoFromResult } from '@src/utils/study/finishStudyInfo'

import { Summary2InitialState, Summary2QuizMeta } from './useSummary2View'

export type { Summary2FilledEntry }

type UseSummary2QuizArgs = {
  props: ILegacyStudyData
  isReady: boolean
  totalBlanks: number
  quizAnswerCount: number
  exampleData: ISummary2Example[]
  initial: Summary2InitialState
  getQuizMeta: (quizNo: number) => Summary2QuizMeta | null
  questionNoToQuizNo: number[]
  studyMode: Mode
  /**
   * 리뷰 모드 & 이전 학습 통과(Average >= 70) 상태.
   * true 이면 모든 빈칸을 정답으로 미리 채워 완료 상태(문장 음원 재생 + 다음 스텝 진입 가능)로 진입한다.
   */
  isReviewPass?: boolean
  heart: {
    setMax: (n: number) => void
    setCurrent: (n: number) => void
    decrease: () => void
  }
  quizFeedback: {
    presentResult: (isCorrect: boolean, callback: () => void) => void
  } | null
}

export function useSummary2Quiz({
  props,
  isReady,
  totalBlanks,
  quizAnswerCount,
  exampleData,
  initial,
  getQuizMeta,
  questionNoToQuizNo,
  studyMode,
  isReviewPass = false,
  heart,
  quizFeedback,
}: UseSummary2QuizArgs) {
  const studentAnswer = useStudentAnswer(studyMode)

  const [questionNo, setQuestionNo] = useState<number>(1)
  const [quizNo, setQuizNo] = useState<number>(1)
  const [tryCount, setTryCount] = useState<number>(0)
  const [partialRecord, setPartialRecord] = useState<string>('')
  const [bottomExamples, setBottomExamples] = useState<ISummary2Example[]>([])
  const [filledTexts, setFilledTexts] = useState<
    Record<number, Summary2FilledEntry>
  >({})
  const [pressedOptionText, setPressedOptionText] = useState<string | null>(
    null,
  )
  const [incorrectAnswer, setIncorrectAnswer] = useState<string | null>(null)
  const [isCheckingAnswer, setIsCheckingAnswer] = useState<boolean>(false)
  const [isComplete, setIsComplete] = useState<boolean>(false)
  const isWorking = useRef<boolean>(true)

  const currentExample =
    questionNo >= 1 && questionNo <= exampleData.length
      ? exampleData[questionNo - 1]
      : null

  useEffect(() => {
    if (!isReady) return

    // 리뷰 통과 진입: 모든 빈칸을 정답으로 프리필 → isComplete = true 로 문장 음원 재생 화면 진입
    if (isReviewPass) {
      const prefilled: Record<number, Summary2FilledEntry> = {}
      exampleData.forEach((ex, i) => {
        prefilled[i + 1] = { text: ex.Text, isCorrect: true }
      })
      setQuestionNo(totalBlanks + 1)
      setQuizNo(initial.startQuizNo)
      setTryCount(0)
      setPartialRecord('')
      setBottomExamples([])
      setFilledTexts(prefilled)
      heart.setMax(quizAnswerCount)
      setIsComplete(true)
      isWorking.current = false
      return
    }

    setQuestionNo(initial.startQuestionNo)
    setQuizNo(initial.startQuizNo)
    setTryCount(initial.startTryCount)
    setPartialRecord(initial.startPartialRecord)
    setBottomExamples(initial.startBottomExamples)
    setFilledTexts(initial.startFilledTexts)

    studentAnswer.addStudentAnswers(
      studentAnswer.convertPartialRecordToScoreBoard(
        props.recordedData ?? [],
        quizAnswerCount,
      ),
    )
    heart.setMax(quizAnswerCount)
    heart.setCurrent(quizAnswerCount - initial.startTryCount)

    if (initial.startQuestionNo > totalBlanks) {
      setIsComplete(true)
    }

    isWorking.current = false
  }, [isReady])

  useEffect(() => {
    if (!isReady) return
    if (questionNo === initial.startQuestionNo) return
    setTryCount(0)
  }, [questionNo])

  const advanceAfterAnswer = (currentPartial: string) => {
    if (questionNo + 1 > totalBlanks) {
      setIsComplete(true)
      return
    }
    const nextQuizNoExpected = questionNoToQuizNo[questionNo]
    if (nextQuizNoExpected !== quizNo) {
      setQuizNo(nextQuizNoExpected)
      setPartialRecord('')
    } else {
      setPartialRecord(currentPartial + ',')
    }
    // 문제당 chance 정책: 다음 문제로 넘어갈 때마다 하트를 최대치로 리셋한다.
    heart.setCurrent(quizAnswerCount)
    setQuestionNo(questionNo + 1)
    // tryCount 는 새 문제(빈칸) 진입 시 반드시 0 부터 시작해야 한다.
    // useEffect([questionNo]) 의 skip 조건이 initial.startQuestionNo 재계산으로
    // 오작동할 수 있어(patchStepRecord → initial 재계산 → questionNo === 새 startQuestionNo → skip),
    // 여기서 명시적으로 리셋해 이전 문제의 tryCount 가 다음 문제로 새어나가지 않도록 한다.
    setTryCount(0)
  }

  const persistPartial = async (
    nextPartialRecord: string,
    isCorrect: boolean,
    selectedText: string,
    nextTry: number,
    currentExample: ISummary2Example,
  ): Promise<boolean> => {
    const quizMeta = getQuizMeta(quizNo)
    if (!quizMeta) return false

    const answerData: IScoreBoardData = {
      quizNo: questionNo,
      maxCount: quizAnswerCount,
      answerCount: nextTry,
      ox: isCorrect,
    }

    const userAnswer = studentAnswer.makeUserPartialAnswerData({
      mobile: '',
      studyId: props.studyId,
      studentHistoryId: props.studentHistoryId,
      bookType: props.bookType,
      step: props.currentStep,
      quizId: quizMeta.quizId,
      quizNo: quizMeta.quizNo,
      currentQuizNo: questionNo,
      correct: currentExample.Text,
      selectedAnswer: selectedText,
      partialRecord: nextPartialRecord,
      tryCount: nextTry,
      maxQuizCount: quizAnswerCount,
      quizLength: totalBlanks,
      isCorrect,
      answerData,
      isFinishStudy: props.lastStep === props.currentStep,
    })

    try {
      const res = await saveUserAnswerPartial(studyMode, userAnswer)
      captureFinishStudyInfoFromResult(res)
      if (Number(res.result) !== 0) return false
    } catch {
      return false
    }

    studentAnswer.addStudentAnswer(answerData)

    const tempRecord: IRecordAnswerType = {
      QuizId: `${quizMeta.quizId}`,
      QuizNo: quizMeta.quizNo,
      CurrentQuizNo: quizMeta.quizNo,
      OX: isCorrect ? '1' : '2',
      TempText: '',
      PenaltyWord: '',
      Correct: currentExample.Text,
      StudentAnswer: nextPartialRecord,
      AnswerCount: nextTry,
    }
    props.onUpdateRecord?.(tempRecord)
    return true
  }

  const handleOptionClick = async (selectedText: string) => {
    if (isCheckingAnswer || isWorking.current) return
    if (!currentExample) return

    isWorking.current = true
    setIsCheckingAnswer(true)
    setPressedOptionText(selectedText)

    const isCorrect = currentExample.Text === selectedText
    const correctMark = isCorrect ? '1' : '2'
    const nextPartialRecord = partialRecord + correctMark
    const nextTry = tryCount + 1

    const persisted = await persistPartial(
      nextPartialRecord,
      isCorrect,
      selectedText,
      nextTry,
      currentExample,
    )
    if (!persisted) {
      setPressedOptionText(null)
      setIsCheckingAnswer(false)
      isWorking.current = false
      return
    }

    setPartialRecord(nextPartialRecord)
    setTryCount(nextTry)
    if (!isCorrect) heart.decrease()

    if (isCorrect) {
      const applyCorrect = () => {
        setFilledTexts((prev) => ({
          ...prev,
          [questionNo]: { text: currentExample.Text, isCorrect: true },
        }))
        setBottomExamples((prev) =>
          prev.filter((ex) => ex.Text !== currentExample.Text),
        )
        setIncorrectAnswer(null)
        setPressedOptionText(null)
        setIsCheckingAnswer(false)
        isWorking.current = false
        advanceAfterAnswer(nextPartialRecord)
      }
      if (quizFeedback) {
        quizFeedback.presentResult(true, applyCorrect)
      } else {
        applyCorrect()
      }
      return
    }

    if (nextTry < quizAnswerCount) {
      const clearWrong = () => {
        setIncorrectAnswer(null)
        setPressedOptionText(null)
        setIsCheckingAnswer(false)
        isWorking.current = false
      }
      setIncorrectAnswer(selectedText)
      if (quizFeedback) {
        quizFeedback.presentResult(false, clearWrong)
      } else {
        clearWrong()
      }
    } else {
      const advance = () => {
        setFilledTexts((prev) => ({
          ...prev,
          [questionNo]: { text: currentExample.Text, isCorrect: false },
        }))
        setBottomExamples((prev) =>
          prev.filter((ex) => ex.Text !== currentExample.Text),
        )
        setIncorrectAnswer(null)
        setPressedOptionText(null)
        setIsCheckingAnswer(false)
        isWorking.current = false
        advanceAfterAnswer(nextPartialRecord)
      }
      setIncorrectAnswer(selectedText)
      if (quizFeedback) {
        quizFeedback.presentResult(false, advance)
      } else {
        advance()
      }
    }
  }

  return {
    questionNo,
    currentExample,
    filledTexts,
    bottomExamples,
    pressedOptionText,
    incorrectAnswer,
    isCheckingAnswer,
    isComplete,
    handleOptionClick,
  }
}
