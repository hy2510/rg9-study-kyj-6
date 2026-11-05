import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useStudentAnswer } from '@hooks/study/legacy/useStudentAnswer'
import useStudyAudio from '@hooks/study/legacy/useStudyAudio'
import { useSpellingPhysicalKeyboard } from '@hooks/study/remix/useSpellingPhysicalKeyboard'
import { deletePenalty, saveUserAnswer } from '@services/studyApi'
import {
  IRecordAnswerType,
  IScoreBoardData,
} from '@src/interfaces/common/Common'
import { Mode } from '@src/interfaces/common/Types'
import { ILegacyStudyData } from '@src/interfaces/study/legacy/LegacyStudy'
import { captureFinishStudyInfoFromResult } from '@src/utils/study/finishStudyInfo'
import { buildSentenceTokens } from '@src/utils/study/legacy/clozeTestUtils'
import {
  buildDisplayText,
  getLettersOnly,
  isSpellingCorrect,
} from '@utils/spellingUtils'

import {
  ClozeTest2InitialState,
  ClozeTest2InputValue,
  ClozeTest2PenaltyState,
  ClozeTest2QuizMeta,
} from './useClozeTest2View'

type UseClozeTest2QuizArgs = {
  props: ILegacyStudyData
  isReady: boolean
  totalQuiz: number
  quizAnswerCount: number
  isEnabledPenalty: boolean
  initial: ClozeTest2InitialState
  getQuizMeta: (quizNo: number) => ClozeTest2QuizMeta | null
  makeEmptyInputs: (quizNo: number) => ClozeTest2InputValue[]
  recordedData: IRecordAnswerType[]
  studyMode: Mode
  /**
   * 리뷰 모드 & 이전 학습 통과(Average >= 70) 상태.
   * true 이면 각 blank 를 정답으로 미리 채워 표시하고 스펠링 입력을 잠근 뒤,
   * Enter/Tab 만으로 다음 문제로 진행한다.
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

export function useClozeTest2Quiz({
  props,
  isReady,
  totalQuiz,
  quizAnswerCount,
  isEnabledPenalty,
  initial,
  getQuizMeta,
  makeEmptyInputs,
  recordedData,
  studyMode,
  isReviewPass = false,
  heart,
  quizFeedback,
}: UseClozeTest2QuizArgs) {
  const studentAnswer = useStudentAnswer(studyMode)
  const { playState, playAudio, stopAudio } = useStudyAudio()

  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(1)
  const [tryCount, setTryCount] = useState<number>(0)
  const [inputValues, setInputValues] = useState<ClozeTest2InputValue[]>([])
  const [currentBlankIndex, setCurrentBlankIndex] = useState<number>(0)
  const [inputLetters, setInputLetters] = useState<string>('')
  const [penaltyState, setPenaltyState] =
    useState<ClozeTest2PenaltyState>('none')
  const isWorking = useRef<boolean>(true)
  const onEnterOrTabRef = useRef<() => void>(() => {})
  // 패널티 비활성 & 오답 소진 시 정답을 노출하고 음원을 들려준 후 다음 문제로
  // 진행하는 "reveal" 상태. 노출 중에는 유저 입력을 차단하고, Enter/Tab/스킵
  // 버튼으로 즉시 스킵할 수 있다. 음원이 없으면 REVEAL_FALLBACK_MS 뒤 자동 진행.
  const REVEAL_FALLBACK_MS = 2000
  const [isRevealing, setIsRevealing] = useState<boolean>(false)
  const isRevealingRef = useRef<boolean>(false)
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearRevealTimer = useCallback(() => {
    if (revealTimerRef.current !== null) {
      clearTimeout(revealTimerRef.current)
      revealTimerRef.current = null
    }
    isRevealingRef.current = false
    setIsRevealing(false)
  }, [])

  useEffect(
    () => () => {
      if (revealTimerRef.current !== null) clearTimeout(revealTimerRef.current)
    },
    [],
  )

  useEffect(() => {
    if (!isReady) return
    setCurrentQuizIndex(initial.startQuizNo)
    setTryCount(initial.startTryCount)
    // 리뷰 통과 진입: 각 blank 를 정답으로 프리필 → 유저는 Enter 로 다음 문제로 이동
    const initialInputs = (() => {
      if (!isReviewPass) return initial.startInputValues
      const meta = getQuizMeta(initial.startQuizNo)
      if (!meta) return initial.startInputValues
      return meta.correctAnswers.map((ans) => ({
        text: ans,
        isCorrected: true,
      }))
    })()
    setInputValues(initialInputs)
    setCurrentBlankIndex(initial.startCurrentIndex)
    setPenaltyState(initial.startPenaltyState)
    if (isReviewPass) {
      const meta = getQuizMeta(initial.startQuizNo)
      setInputLetters(getLettersOnly(meta?.correctAnswers[initial.startCurrentIndex] ?? ''))
    } else {
      setInputLetters('')
    }
    studentAnswer.setStudentAnswers(recordedData, quizAnswerCount)
    heart.setMax(quizAnswerCount)
    heart.setCurrent(quizAnswerCount - initial.startTryCount)
    isWorking.current = false
    const meta = getQuizMeta(initial.startQuizNo)
    if (initial.startPenaltyState === 'none' && meta?.sound)
      playAudio(meta.sound)
  }, [isReady])

  // 리뷰 통과 모드에서 문제가 바뀔 때마다 새 문제의 정답으로 다시 프리필한다.
  useEffect(() => {
    if (!isReady || !isReviewPass) return
    const meta = getQuizMeta(currentQuizIndex)
    if (!meta) return
    setInputValues(
      meta.correctAnswers.map((ans) => ({ text: ans, isCorrected: true })),
    )
    setCurrentBlankIndex(0)
    setInputLetters(getLettersOnly(meta.correctAnswers[0] ?? ''))
  }, [isReady, isReviewPass, currentQuizIndex])

  useEffect(() => {
    if (!isReady) return
    isWorking.current = false
  }, [currentQuizIndex])

  // 헤더 Q 번호 화면 동기화 — currentQuizIndex 를 컨테이너로 전달
  useEffect(() => {
    props.onActiveQuizChange?.(currentQuizIndex)
  }, [currentQuizIndex, props])

  useEffect(() => {
    if (penaltyState === 'success') {
      // eslint-disable-next-line react-hooks/immutability -- finalizePenalty 는 컴포넌트 함수 내 정의
      finalizePenalty()
    }
  }, [penaltyState])

  const currentMeta = isReady ? getQuizMeta(currentQuizIndex) : null

  const sentenceTokens = useMemo(
    () => (currentMeta ? buildSentenceTokens(currentMeta.sentence) : []),
    [currentMeta],
  )

  const handleKeyPress = useCallback(
    (key: string) => {
      if (!currentMeta) return
      // 정답 노출 중: Enter/Tab 으로 즉시 스킵 진행, 나머지 키는 무시
      if (isRevealingRef.current) {
        if (key === 'enter' || key === 'tab') onEnterOrTabRef.current()
        return
      }
      if (isWorking.current) return
      // 리뷰 통과 진입: 스펠링 입력을 잠그고 Enter/Tab 만 다음 문제 진행 트리거로 사용
      if (isReviewPass) {
        if (key === 'enter' || key === 'tab') onEnterOrTabRef.current()
        return
      }
      const maxLen = getLettersOnly(
        currentMeta.correctAnswers[currentBlankIndex] ?? '',
      ).length
      if (key === 'backspace') {
        setInputLetters((prev) => prev.slice(0, -1))
      } else if (key === 'enter' || key === 'tab') {
        onEnterOrTabRef.current()
      } else if (/^[a-zA-Z]$/.test(key)) {
        setInputLetters((prev) => (prev + key.toLowerCase()).slice(0, maxLen))
      }
    },
    [currentBlankIndex, currentMeta, isReviewPass],
  )

  useSpellingPhysicalKeyboard({ onKeyPress: handleKeyPress })

  // eslint-disable-next-line react-hooks/immutability -- checkAnswer 는 컴포넌트 함수 내 정의
  useEffect(() => {
    if (!isReady || !currentMeta) return
    if (isWorking.current) return
    if (inputLetters === '') return
    // 리뷰 통과(티쳐 모드): 정답이 자동 프리필되어 있으므로 자동 채점을
    // 발동시키면 즉시 다음 문제로 넘어가 확인이 불가능해진다.
    // Enter/Tab(onEnterOrTabRef) 로만 다음 문제로 이동하도록 자동 검증을 스킵.
    if (isReviewPass) return

    const correctText = currentMeta.correctAnswers[currentBlankIndex] ?? ''
    const maxLen = getLettersOnly(correctText).length
    if (inputLetters.length < maxLen) return

    const filledText = buildDisplayText(correctText, inputLetters)

    if (penaltyState === 'penalty') {
      if (isSpellingCorrect(filledText, correctText)) {
        const updatedValues = inputValues.map((v, i) =>
          i === currentBlankIndex ? { text: filledText, isCorrected: true } : v,
        )
        setInputValues(updatedValues)
        const nextIndex = updatedValues.findIndex((v) => !v.isCorrected)
        if (nextIndex === -1) {
          setPenaltyState('success')
        } else {
          setCurrentBlankIndex(nextIndex)
          setInputLetters('')
        }
      }
      return
    }

    if (penaltyState !== 'none') return

    if (!isSpellingCorrect(filledText, correctText)) return

    const updatedValues = inputValues.map((v, i) =>
      i === currentBlankIndex ? { text: filledText, isCorrected: true } : v,
    )

    const nextEmpty = updatedValues.findIndex(
      (v, i) => !v.isCorrected && !v.text && i !== currentBlankIndex,
    )
    if (nextEmpty !== -1) {
      setInputValues(updatedValues)
      setCurrentBlankIndex(nextEmpty)
      setInputLetters('')
    } else {
      setInputValues(updatedValues)
      // eslint-disable-next-line react-hooks/immutability -- checkAnswer 는 컴포넌트 함수 내 정의
      checkAnswer(updatedValues)
    }
  }, [inputLetters, currentBlankIndex, penaltyState, isReady, isReviewPass])

  const currentCorrectText =
    currentMeta?.correctAnswers[currentBlankIndex] ?? ''
  const correctLetterLen = getLettersOnly(currentCorrectText).length
  const isCurrentAllFilled = inputLetters.length === correctLetterLen
  const isCurrentIncorrect =
    isCurrentAllFilled && !isSpellingCorrect(inputLetters, currentCorrectText)

  const onClickBlank = (blankIndex: number) => {
    if (blankIndex === currentBlankIndex) return
    if (penaltyState !== 'none') return
    const val = inputValues[blankIndex]
    if (!val || val.isCorrected) return

    const currentVal = inputValues[currentBlankIndex]
    let nextValues = inputValues
    if (currentVal && !currentVal.isCorrected && inputLetters !== '') {
      const displayText = buildDisplayText(currentCorrectText, inputLetters)
      nextValues = inputValues.map((v, i) =>
        i === currentBlankIndex ? { text: displayText, isCorrected: false } : v,
      )
      setInputValues(nextValues)
    }

    const savedLetters = getLettersOnly(nextValues[blankIndex]?.text ?? '')
    setCurrentBlankIndex(blankIndex)
    setInputLetters(savedLetters)
  }

  const handleNextInput = () => {
    if (penaltyState !== 'none') return
    const uncorrected = inputValues
      .map((v, i) => i)
      .filter((i) => !inputValues[i].isCorrected && i !== currentBlankIndex)
    if (uncorrected.length === 0) return
    const next =
      uncorrected.find((i) => i > currentBlankIndex) ?? uncorrected[0]

    const currentVal = inputValues[currentBlankIndex]
    let nextValues = inputValues
    if (currentVal && !currentVal.isCorrected && inputLetters !== '') {
      const displayText = buildDisplayText(currentCorrectText, inputLetters)
      nextValues = inputValues.map((v, i) =>
        i === currentBlankIndex ? { text: displayText, isCorrected: false } : v,
      )
      setInputValues(nextValues)
    }

    const savedLetters = getLettersOnly(nextValues[next]?.text ?? '')
    setCurrentBlankIndex(next)
    setInputLetters(savedLetters)
  }

  const handleSubmit = () => {
    if (isWorking.current) return
    const meta = currentMeta
    if (!meta) return
    const currentText = buildDisplayText(
      meta.correctAnswers[currentBlankIndex] ?? '',
      inputLetters,
    )
    const valuesToSubmit = inputValues.map((v, i) => {
      if (i !== currentBlankIndex) return v
      const isCorrect =
        meta.correctAnswers[i] === currentText.trimStart().trimEnd()
      return { text: currentText, isCorrected: isCorrect }
    })

    setInputValues(valuesToSubmit)
    checkAnswer(valuesToSubmit)
  }

  const advanceToNext = () => {
    const nextQuizNo = currentQuizIndex + 1
    if (nextQuizNo <= totalQuiz) {
      setInputValues(makeEmptyInputs(nextQuizNo))
      setCurrentBlankIndex(0)
      setPenaltyState('none')
      setInputLetters('')
      setTryCount(0)
      heart.setCurrent(quizAnswerCount)
      isWorking.current = false
      setCurrentQuizIndex(nextQuizNo)
      const meta = getQuizMeta(nextQuizNo)
      if (meta?.sound) playAudio(meta.sound)
    } else {
      props.onFinishActivity()
    }
  }

  useEffect(() => {
    onEnterOrTabRef.current = () => {
      // 정답 노출 중: 타이머 취소 + 즉시 다음 문제로 진행
      if (isRevealingRef.current) {
        clearRevealTimer()
        stopAudio()
        advanceToNext()
        return
      }
      // 리뷰 통과: Enter/Tab 만으로 다음 문제 진행 (blank 는 이미 정답 프리필 상태)
      if (isReviewPass) {
        if (isWorking.current) return
        stopAudio()
        advanceToNext()
        return
      }
      if (penaltyState !== 'none') return
      if (inputLetters === '') return
      const isLastBlank = currentBlankIndex === inputValues.length - 1
      const hasOtherUncorrected = inputValues.some(
        (v, i) => !v.isCorrected && i !== currentBlankIndex,
      )
      if (isLastBlank || !hasOtherUncorrected) {
        handleSubmit()
      } else {
        handleNextInput()
      }
    }
  })

  const evaluateInputs = (
    values: ClozeTest2InputValue[],
    meta: ClozeTest2QuizMeta,
  ) => {
    const nextInputs: ClozeTest2InputValue[] = []
    const userTokens: string[] = []
    const recordTokens: string[] = []
    let firstWrongIndex = -1
    for (let i = 0; i < meta.correctAnswers.length; i++) {
      const userText = (values[i]?.text ?? '').trimStart().trimEnd()
      const isEqual = meta.correctAnswers[i] === userText
      nextInputs.push({ text: userText, isCorrected: isEqual })
      userTokens.push(userText)
      recordTokens.push(userText + (isEqual ? '1' : '0'))
      if (!isEqual && firstWrongIndex === -1) firstWrongIndex = i
    }
    return {
      isAllCorrect: nextInputs.every((v) => v.isCorrected),
      nextInputs,
      firstWrongIndex,
      correctJoined: meta.correctAnswers.join('┒'),
      userJoined: userTokens.join('┒'),
      recordJoined: recordTokens.join('┒'),
    }
  }

  const revealCorrectAnswerAndAdvance = (
    evaluated?: ClozeTest2InputValue[],
  ) => {
    const meta = currentMeta
    if (!meta) {
      advanceToNext()
      return
    }
    // 각 blank 별로 유저가 맞춘 것과 공개된 정답을 구분한다.
    // - 유저가 맞춘 blank: 기존 텍스트 + 초록(SentenceBlankFilled)
    // - 유저가 못 맞춘 blank: 정답 텍스트 + 빨강(SentenceBlankRevealed)
    const source = evaluated ?? inputValues
    const revealedValues: ClozeTest2InputValue[] = meta.correctAnswers.map(
      (ans, i) => {
        const prev = source[i]
        if (prev?.isCorrected) return { ...prev, isRevealed: false }
        return { text: ans, isCorrected: true, isRevealed: true }
      },
    )
    setInputValues(revealedValues)
    setInputLetters('')
    isWorking.current = true
    isRevealingRef.current = true
    setIsRevealing(true)

    // 정답 음원을 재생하고, 재생이 끝나면 다음 문제로 진행한다.
    // 음원이 없으면 REVEAL_FALLBACK_MS 뒤 자동 진행.
    const onRevealFinished = () => {
      clearRevealTimer()
      advanceToNext()
    }
    if (meta.sound) {
      playAudio(meta.sound, onRevealFinished)
    } else {
      revealTimerRef.current = setTimeout(onRevealFinished, REVEAL_FALLBACK_MS)
    }
  }

  const enterPostAnswerFlow = (
    isCorrect: boolean,
    evaluated?: ClozeTest2InputValue[],
  ) => {
    stopAudio()
    if (isCorrect) {
      advanceToNext()
      return
    }
    if (isEnabledPenalty) {
      setInputValues(makeEmptyInputs(currentQuizIndex))
      setPenaltyState('penalty')
      setCurrentBlankIndex(0)
      setInputLetters('')
      isWorking.current = false
    } else {
      revealCorrectAnswerAndAdvance(evaluated)
    }
  }

  const enterRetryFlow = (
    nextInputs: ClozeTest2InputValue[],
    firstWrongIndex: number,
    newTryCount: number,
  ) => {
    const clearedInputs = nextInputs.map((v) =>
      v.isCorrected ? v : { text: '', isCorrected: false },
    )
    setInputValues(clearedInputs)
    setTryCount(newTryCount)
    setCurrentBlankIndex(firstWrongIndex)
    setInputLetters('')
    isWorking.current = false
  }

  const checkAnswer = async (values: ClozeTest2InputValue[]) => {
    if (isWorking.current) return
    const meta = currentMeta
    if (!meta) return
    const {
      isAllCorrect,
      nextInputs,
      firstWrongIndex,
      correctJoined,
      userJoined,
      recordJoined,
    } = evaluateInputs(values, meta)

    isWorking.current = true
    stopAudio()

    const newTryCount = tryCount + 1

    const answerData: IScoreBoardData = {
      quizNo: currentQuizIndex,
      maxCount: quizAnswerCount,
      answerCount: newTryCount,
      ox: isAllCorrect,
    }

    const userAnswer = studentAnswer.makeUserAnswerData({
      mobile: '',
      studyId: props.studyId,
      studentHistoryId: props.studentHistoryId,
      bookType: props.bookType,
      step: props.currentStep,
      quizId: meta.quizId,
      quizNo: meta.quizNo,
      currentQuizNo: currentQuizIndex,
      correct: correctJoined,
      selectedAnswer: userJoined,
      tryCount: newTryCount,
      maxQuizCount: quizAnswerCount,
      quizLength: totalQuiz,
      isCorrect: isAllCorrect,
      answerData,
      isEnabledPenalty,
      isFinishStudy: props.lastStep === props.currentStep,
    })

    try {
      const res = await saveUserAnswer(studyMode, userAnswer)
      captureFinishStudyInfoFromResult(res)
      if (Number(res.result) !== 0) {
        isWorking.current = false
        return
      }
    } catch {
      isWorking.current = false
      return
    }

    studentAnswer.addStudentAnswer(answerData)
    const tempRecord: IRecordAnswerType = {
      QuizId: `${meta.quizId}`,
      QuizNo: meta.quizNo,
      CurrentQuizNo: meta.quizNo,
      OX: isAllCorrect ? '1' : '2',
      TempText: '',
      PenaltyWord: '',
      Correct: correctJoined,
      StudentAnswer: recordJoined,
      AnswerCount: newTryCount,
    }
    props.onUpdateRecord?.(tempRecord)
    if (!isAllCorrect) {
      heart.decrease()
    }

    const proceed = () => {
      if (isAllCorrect || newTryCount >= quizAnswerCount) {
        enterPostAnswerFlow(isAllCorrect, nextInputs)
      } else {
        enterRetryFlow(nextInputs, firstWrongIndex, newTryCount)
      }
    }

    if (quizFeedback) {
      quizFeedback.presentResult(isAllCorrect, proceed)
    } else {
      proceed()
    }
  }

  const finalizePenalty = async () => {
    const meta = currentMeta
    if (!meta) return
    const isLastQuiz = currentQuizIndex + 1 > totalQuiz
    try {
      const res = await deletePenalty(props.mode, {
        mobile: '',
        bookType: props.bookType,
        studyId: props.studyId,
        studentHistoryId: props.studentHistoryId,
        step: String(props.currentStep),
        quizId: meta.quizId,
        isLastQuiz,
        isFinishStudy: isLastQuiz && props.lastStep === props.currentStep,
      })
      captureFinishStudyInfoFromResult(res)
      if (Number(res.result) !== 0) return
    } catch {
      return
    }

    const goNext = () => {
      stopAudio()
      advanceToNext()
    }
    if (meta.sound) playAudio(meta.sound, goNext)
    else goNext()
  }

  const onPlaySoundToggle = () => {
    const sound = currentMeta?.sound
    if (!sound) return
    if (playState === 'playing') {
      stopAudio()
    } else {
      playAudio(sound)
    }
  }

  return {
    currentMeta,
    sentenceTokens,
    playState,
    penaltyState,
    inputValues,
    currentBlankIndex,
    inputLetters,
    currentCorrectText,
    isCurrentIncorrect,
    isRevealing,
    handleKeyPress,
    onPlaySoundToggle,
    onClickBlank,
  }
}
