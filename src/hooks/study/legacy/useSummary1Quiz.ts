import { ChangeEvent, useEffect, useRef, useState } from 'react'

import shuffle from 'lodash/shuffle'

import { useStudentAnswer } from '@hooks/study/legacy/useStudentAnswer'
import { getSummaryHint } from '@services/quiz/SummaryApi'
import { deletePenalty, saveUserAnswer } from '@services/studyApi'
import {
  IRecordAnswerType,
  IScoreBoardData,
} from '@src/interfaces/common/Common'
import { Mode } from '@src/interfaces/common/Types'
import { ISummary1Hint } from '@src/interfaces/study/ISummary'
import { ILegacyStudyData } from '@src/interfaces/study/legacy/LegacyStudy'
import { getLettersOnly, isSpellingCorrect } from '@src/utils/spellingUtils'
import { captureFinishStudyInfoFromResult } from '@src/utils/study/finishStudyInfo'

import { Summary1PenaltyState, Summary1QuizMeta } from './useSummary1View'

export type SelectedAnswer = { quizId: string; isCorrect: boolean }

export type PenaltyState = {
  isActive: boolean
  expectedQuizId: string
  quizId: string
  isLastQuiz: boolean
  words: string[]
  inputValues: string[]
  currentInputIndex: number
  isNext: boolean
}

const INITIAL_PENALTY_STATE: PenaltyState = {
  isActive: false,
  expectedQuizId: '',
  quizId: '',
  isLastQuiz: false,
  words: [],
  inputValues: [],
  currentInputIndex: 0,
  isNext: false,
}

type UseSummary1QuizArgs = {
  props: ILegacyStudyData
  isReady: boolean
  totalQuiz: number
  quizAnswerCount: number
  orderedQuizzes: Summary1QuizMeta[]
  correctOrder: string[]
  startQuizNo: number
  startTryCount: number
  startPenaltyState: Summary1PenaltyState
  isEnablePenaltyReview: boolean
  hintMeta: ISummary1Hint
  recordedData: IRecordAnswerType[]
  studyMode: Mode
  /**
   * 리뷰 모드 & 이전 학습 통과(Average >= 70) 상태.
   * true 이면 모든 슬롯을 정답으로 미리 채워 완료 상태(음원 순차 재생 + 다음 스텝 진입 가능)로 진입한다.
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
  /**
   * 정오답/힌트 후 해당 quiz 문장의 음원을 재생하기 위한 훅.
   * 없거나 URL 이 비어있으면 음원 재생 없이 즉시 다음 단계로 진행한다.
   */
  soundUrlsOrdered?: string[]
  playAudio?: (src: string, cb?: () => void) => void
}

export function useSummary1Quiz({
  props,
  isReady,
  totalQuiz,
  quizAnswerCount,
  orderedQuizzes,
  correctOrder,
  startQuizNo,
  startTryCount,
  startPenaltyState,
  isEnablePenaltyReview,
  hintMeta,
  recordedData,
  studyMode,
  isReviewPass = false,
  heart,
  quizFeedback,
  soundUrlsOrdered,
  playAudio,
}: UseSummary1QuizArgs) {
  /**
   * 지정 인덱스 문장 음원을 재생 후 콜백. URL 이 없거나 재생 훅 미제공이면 즉시 콜백.
   * 실패에도 안전하게 콜백이 호출되도록 useStudyAudio 의 `endFn` 만 신뢰.
   */
  const playSentenceThen = (index: number, cb: () => void) => {
    const url = soundUrlsOrdered?.[index]?.trim()
    if (!url || !playAudio) {
      cb()
      return
    }
    playAudio(url, cb)
  }
  const studentAnswer = useStudentAnswer(studyMode)

  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswer[]>([])
  const [availableOptions, setAvailableOptions] = useState<string[]>([])
  const [tryCountByQuizNo, setTryCountByQuizNo] = useState<
    Record<number, number>
  >({})
  const [pressedOptionId, setPressedOptionId] = useState<string | null>(null)
  const [incorrectAnswer, setIncorrectAnswer] = useState<string | null>(null)
  const [isCheckingAnswer, setIsCheckingAnswer] = useState<boolean>(false)
  const isWorking = useRef<boolean>(true)

  const [penaltyState, setPenaltyState] = useState<PenaltyState>(
    INITIAL_PENALTY_STATE,
  )
  const [hintTry, setHintTry] = useState<number>(0)

  const isCompleted = isReady && selectedAnswers.length === totalQuiz

  useEffect(() => {
    if (!isReady) return

    // 리뷰 통과 진입: 모든 슬롯을 정답 프리필 → isCompleted = true 로 요약/음원 재생 화면 진입
    if (isReviewPass) {
      setSelectedAnswers(
        correctOrder.map((qId) => ({ quizId: qId, isCorrect: true })),
      )
      setAvailableOptions([])
      setTryCountByQuizNo({})
      setHintTry(0)
      studentAnswer.setStudentAnswers(recordedData, quizAnswerCount)
      heart.setMax(quizAnswerCount)
      heart.setCurrent(quizAnswerCount)
      isWorking.current = false
      return
    }

    const startIdx = Math.min(Math.max(startQuizNo - 1, 0), totalQuiz)
    const prefilled: SelectedAnswer[] = correctOrder
      .slice(0, startIdx)
      .map((qId) => {
        const meta = orderedQuizzes.find((q) => q.quizId === qId)
        const record = meta
          ? recordedData.find((r) => r.QuizNo === meta.quizNo)
          : undefined
        return { quizId: qId, isCorrect: record?.OX === '1' }
      })
    const remaining = correctOrder.slice(startIdx)
    setSelectedAnswers(prefilled)
    // 리뷰 미통과 유저도 옵션을 셔플해 처음부터 다시 풀도록 한다.
    const shouldShuffleOptions =
      (studyMode === 'student' || studyMode === 'guide' || studyMode === 'trial') || studyMode === 'review'
    setAvailableOptions(
      shouldShuffleOptions ? shuffle([...remaining]) : remaining,
    )
    setTryCountByQuizNo(
      startTryCount > 0 ? { [startQuizNo]: startTryCount } : {},
    )
    setHintTry((studyMode === 'student' || studyMode === 'guide' || studyMode === 'trial') ? (hintMeta.Try ?? 0) : 0)
    studentAnswer.setStudentAnswers(recordedData, quizAnswerCount)
    heart.setMax(quizAnswerCount)
    heart.setCurrent(quizAnswerCount - startTryCount)

    if (startPenaltyState === 'penalty') {
      const penaltyQuizId = correctOrder[startIdx]
      if (penaltyQuizId) {
        const replaceHTMLReg = /<[^>]*>/gi
        const cleanText = (
          orderedQuizzes.find((q) => q.quizId === penaltyQuizId)?.text ?? ''
        ).replace(replaceHTMLReg, '')
        const words = cleanText.split(' ').filter((w) => w.length > 0)
        setPenaltyState({
          isActive: true,
          expectedQuizId: penaltyQuizId,
          quizId: penaltyQuizId,
          isLastQuiz: startIdx + 1 >= totalQuiz,
          words,
          inputValues: words.map(() => ''),
          currentInputIndex: 0,
          isNext: false,
        })
        props.onPauseTimer?.()
      }
    }

    isWorking.current = false
  }, [isReady])

  const penaltyWasActive = useRef(false)
  useEffect(() => {
    if (penaltyState.isActive) {
      penaltyWasActive.current = true
      props.onPauseTimer?.()
    } else if (penaltyWasActive.current) {
      penaltyWasActive.current = false
      props.onResumeTimer?.()
    }
  }, [penaltyState.isActive])

  const getQuizText = (quizId: string): string => {
    const quiz = orderedQuizzes.find((q) => q.quizId === quizId)
    return quiz?.text ?? ''
  }

  const fillCorrectAndAdvance = (
    expectedQuizId: string,
    isCorrect: boolean,
  ) => {
    setSelectedAnswers((prev) => [
      ...prev,
      { quizId: expectedQuizId, isCorrect },
    ])
    setAvailableOptions((prev) => prev.filter((id) => id !== expectedQuizId))
    setIncorrectAnswer(null)
    setPressedOptionId(null)
    setIsCheckingAnswer(false)
    heart.setCurrent(quizAnswerCount)
    isWorking.current = false
  }

  const finalizePenalty = async () => {
    try {
      const res = await deletePenalty(props.mode, {
        mobile: '',
        bookType: props.bookType,
        studyId: props.studyId,
        studentHistoryId: props.studentHistoryId,
        step: String(props.currentStep),
        quizId: penaltyState.quizId,
        isLastQuiz: penaltyState.isLastQuiz,
        isFinishStudy:
          penaltyState.isLastQuiz && props.lastStep === props.currentStep,
      })
      captureFinishStudyInfoFromResult(res)
    } catch (e) {
      console.error(e)
    }
    const targetQuizId = penaltyState.expectedQuizId
    setPenaltyState(INITIAL_PENALTY_STATE)
    fillCorrectAndAdvance(targetQuizId, false)
  }

  useEffect(() => {
    if (penaltyState.isNext) {
      void finalizePenalty()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [penaltyState.isNext])

  const persistAnswer = async (
    quizId: string,
    quizNo: number,
    selectedQuizId: string,
    isCorrect: boolean,
    nextTryCount: number,
  ): Promise<boolean> => {
    const replaceHTMLReg = /<[^>]*>/gi
    const correctText =
      orderedQuizzes.find((q) => q.quizId === quizId)?.text ?? ''
    const selectedText =
      orderedQuizzes.find((q) => q.quizId === selectedQuizId)?.text ?? ''

    const answerData: IScoreBoardData = {
      quizNo,
      maxCount: quizAnswerCount,
      answerCount: nextTryCount,
      ox: isCorrect,
    }

    const userAnswer = studentAnswer.makeUserAnswerData({
      mobile: '',
      studyId: props.studyId,
      studentHistoryId: props.studentHistoryId,
      bookType: props.bookType,
      step: props.currentStep,
      quizId,
      quizNo,
      currentQuizNo: quizNo,
      correct: correctText.replace(replaceHTMLReg, ''),
      selectedAnswer: selectedText.replace(replaceHTMLReg, ''),
      tryCount: nextTryCount,
      maxQuizCount: quizAnswerCount,
      quizLength: totalQuiz,
      isCorrect,
      answerData,
      isEnabledPenalty: isEnablePenaltyReview,
      isFinishStudy: props.lastStep === props.currentStep && isCorrect,
    })

    try {
      const res = await saveUserAnswer(studyMode, userAnswer)
      if (Number(res.result) !== 0) return false
      captureFinishStudyInfoFromResult(res)
    } catch {
      return false
    }

    if (isCorrect) studentAnswer.addStudentAnswer(answerData)
    const tempRecord: IRecordAnswerType = {
      QuizId: `${quizId}`,
      QuizNo: quizNo,
      CurrentQuizNo: quizNo,
      OX: isCorrect ? '1' : '2',
      TempText: '',
      PenaltyWord: '',
      Correct: correctText.replace(replaceHTMLReg, ''),
      StudentAnswer: selectedText.replace(replaceHTMLReg, ''),
      AnswerCount: nextTryCount,
    }
    props.onUpdateRecord?.(tempRecord)
    return true
  }

  /**
   * 힌트 클릭 — Hint.IsEnabled 이고 남은 횟수가 있을 때.
   * getSummaryHint 호출 → 정답 처리(isCorrect: true)로 저장 → tryCount 증가 → 정답 자동 채택.
   * 7th 동작과 동일.
   */
  const handleHintClick = async () => {
    if (isCheckingAnswer || isWorking.current || penaltyState.isActive) return
    if (!hintMeta.IsEnabled) return
    if ((hintMeta.Max ?? 0) - hintTry <= 0) return

    const currentIndex = selectedAnswers.length
    const expectedQuizId = correctOrder[currentIndex]
    if (!expectedQuizId) return
    const expectedMeta = orderedQuizzes.find((q) => q.quizId === expectedQuizId)
    if (!expectedMeta) return

    isWorking.current = true
    setIsCheckingAnswer(true)

    let hintTryNext = hintTry + 1
    if ((studyMode === 'student' || studyMode === 'guide' || studyMode === 'trial')) {
      try {
        const hintRes = await getSummaryHint(
          props.studyId,
          props.studentHistoryId,
          expectedMeta.quizNo,
          String(props.currentStep),
        )
        if (hintRes.ErrorNo !== 0) {
          setIsCheckingAnswer(false)
          isWorking.current = false
          return
        }
        hintTryNext = hintRes.TryHint
      } catch (e) {
        console.error(e)
        setIsCheckingAnswer(false)
        isWorking.current = false
        return
      }
    }

    const prevTry = tryCountByQuizNo[expectedMeta.quizNo] ?? 0
    const nextTry = prevTry + 1

    const persisted = await persistAnswer(
      expectedQuizId,
      expectedMeta.quizNo,
      expectedQuizId,
      true,
      nextTry,
    )
    if (!persisted) {
      setIsCheckingAnswer(false)
      isWorking.current = false
      return
    }

    setTryCountByQuizNo((prev) => ({
      ...prev,
      [expectedMeta.quizNo]: nextTry,
    }))
    setHintTry(hintTryNext)
    playSentenceThen(currentIndex, () =>
      fillCorrectAndAdvance(expectedQuizId, true),
    )
  }

  /**
   * 패널티 input 변경 — 영문자만 허용, maxLen 이내로 제한.
   * maxLen 채워지고 isSpellingCorrect 이면 다음 단어로 자동 이동.
   */
  const onPenaltyInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const word = penaltyState.words[index] ?? ''
    const maxLen = getLettersOnly(word).length
    const text = e.currentTarget.value
      .replace(/[^a-zA-Z]/g, '')
      .slice(0, maxLen)

    setPenaltyState((prev) => {
      const inputValues = prev.inputValues.map((v, i) =>
        i === index ? text : v,
      )
      if (text.length === maxLen && isSpellingCorrect(text, word)) {
        const nextIndex = index + 1
        if (nextIndex >= prev.words.length) {
          return {
            ...prev,
            inputValues,
            currentInputIndex: nextIndex,
            isNext: true,
          }
        }
        return { ...prev, inputValues, currentInputIndex: nextIndex }
      }
      return { ...prev, inputValues }
    })
  }

  const handleOptionClick = async (selectedQuizId: string) => {
    if (isCheckingAnswer || isWorking.current) return

    isWorking.current = true
    setIsCheckingAnswer(true)
    setPressedOptionId(selectedQuizId)

    const currentIndex = selectedAnswers.length
    const expectedQuizId = correctOrder[currentIndex]
    if (!expectedQuizId) {
      setIsCheckingAnswer(false)
      isWorking.current = false
      return
    }

    const expectedMeta = orderedQuizzes.find((q) => q.quizId === expectedQuizId)
    if (!expectedMeta) {
      setIsCheckingAnswer(false)
      isWorking.current = false
      return
    }

    const isCorrect = selectedQuizId === expectedQuizId
    const prevTry = tryCountByQuizNo[expectedMeta.quizNo] ?? 0
    const nextTry = prevTry + 1

    const persisted = await persistAnswer(
      expectedQuizId,
      expectedMeta.quizNo,
      selectedQuizId,
      isCorrect,
      nextTry,
    )
    if (!persisted) {
      setPressedOptionId(null)
      setIsCheckingAnswer(false)
      isWorking.current = false
      return
    }

    setTryCountByQuizNo((prev) => ({
      ...prev,
      [expectedMeta.quizNo]: nextTry,
    }))
    if (!isCorrect) heart.decrease()

    if (isCorrect) {
      const applyCorrect = () => {
        setSelectedAnswers((prev) => [
          ...prev,
          { quizId: selectedQuizId, isCorrect: true },
        ])
        setAvailableOptions((prev) =>
          prev.filter((id) => id !== selectedQuizId),
        )
        setIncorrectAnswer(null)
        setPressedOptionId(null)
        setIsCheckingAnswer(false)
        heart.setCurrent(quizAnswerCount)
        isWorking.current = false
      }
      const afterFeedback = () => playSentenceThen(currentIndex, applyCorrect)
      if (quizFeedback) {
        quizFeedback.presentResult(true, afterFeedback)
      } else {
        afterFeedback()
      }
    } else {
      setIncorrectAnswer(selectedQuizId)
      const isExhausted = nextTry >= quizAnswerCount
      const isLastQuiz = selectedAnswers.length + 1 >= totalQuiz

      const advanceAfterExhaust = () => {
        if (isEnablePenaltyReview) {
          const replaceHTMLReg = /<[^>]*>/gi
          const cleanText = getQuizText(expectedQuizId).replace(
            replaceHTMLReg,
            '',
          )
          const words = cleanText.split(' ').filter((w) => w.length > 0)
          setIncorrectAnswer(null)
          setPressedOptionId(null)
          setPenaltyState({
            isActive: true,
            expectedQuizId,
            quizId: expectedQuizId,
            isLastQuiz,
            words,
            inputValues: words.map(() => ''),
            currentInputIndex: 0,
            isNext: false,
          })
        } else {
          fillCorrectAndAdvance(expectedQuizId, false)
        }
      }

      const clearWrong = () => {
        if (isExhausted) {
          // Chance 소진 후 정답 문장 음원을 들려주는 동안 유저가 선택한 오답 카드의
          // 시각 상태(pressed + incorrectAnswer)를 유지해야 한다.
          // - pressedOptionId 를 유지해 정답 케이스와 동일한 pressed 스타일(box-shadow: none)
          //   상태로 음원 재생을 마무리한다.
          // - incorrectAnswer / pressedOptionId 리셋은 재생 완료 후 advanceAfterExhaust
          //   내부(fillCorrectAndAdvance 또는 setPenaltyState 브랜치)에서 처리됨.
          playSentenceThen(currentIndex, advanceAfterExhaust)
        } else {
          setPressedOptionId(null)
          setIncorrectAnswer(null)
          setIsCheckingAnswer(false)
          isWorking.current = false
        }
      }
      if (quizFeedback) {
        quizFeedback.presentResult(false, clearWrong)
      } else {
        clearWrong()
      }
    }
  }

  const focusPenaltyWord = (index: number) => {
    setPenaltyState((prev) => ({ ...prev, currentInputIndex: index }))
  }

  return {
    selectedAnswers,
    availableOptions,
    pressedOptionId,
    incorrectAnswer,
    isCheckingAnswer,
    penaltyState,
    hintTry,
    isCompleted,
    tryCountByQuizNo,
    getQuizText,
    handleOptionClick,
    handleHintClick,
    onPenaltyInputChange,
    focusPenaltyWord,
  }
}
