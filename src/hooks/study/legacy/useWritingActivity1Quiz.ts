import { useEffect, useMemo, useRef, useState } from 'react'

import shuffle from 'lodash/shuffle'

import { useStudentAnswer } from '@hooks/study/legacy/useStudentAnswer'
import {
  WritingActivity1QuizMeta,
  WritingActivity1Token,
} from '@hooks/study/legacy/useWritingActivity1View'
import { saveUserAnswer } from '@services/studyApi'
import {
  IRecordAnswerType,
  IScoreBoardData,
} from '@src/interfaces/common/Common'
import { Mode } from '@src/interfaces/common/Types'
import { ILegacyStudyData } from '@src/interfaces/study/legacy/LegacyStudy'
import { captureFinishStudyInfoFromResult } from '@src/utils/study/finishStudyInfo'
import { pendingQuizTryCount } from '@src/utils/study/legacy/pendingQuizTryCount'
import { playAudioBeforeContinue } from '@utils/audio/playAudioBeforeContinue'

type UseWritingActivity1QuizArgs = {
  props: ILegacyStudyData
  isReady: boolean
  totalQuiz: number
  quizAnswerCount: number
  startQuizNo: number
  startTryCount: number
  getQuizMeta: (quizIndex: number) => WritingActivity1QuizMeta | null
  recordedData: IRecordAnswerType[]
  studyMode: Mode
  /**
   * 리뷰 모드 & 이전 학습 통과(Average >= 70) 상태.
   * true 이면 옵션을 정답 순서 그대로 노출한다(재열람 UX). false 이면 리뷰라도 셔플하여 다시 풀도록 한다.
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

export function useWritingActivity1Quiz({
  props,
  isReady,
  totalQuiz,
  quizAnswerCount,
  startQuizNo,
  startTryCount,
  getQuizMeta,
  recordedData,
  studyMode,
  isReviewPass = false,
  heart,
  quizFeedback,
}: UseWritingActivity1QuizArgs) {
  const studentAnswer = useStudentAnswer(studyMode)

  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(1)
  const [tryCount, setTryCount] = useState<number>(0)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [checkState, setCheckState] = useState<
    'idle' | 'correct' | 'incorrect'
  >('idle')
  const [showCorrectAnswer, setShowCorrectAnswer] = useState<boolean>(false)
  const isWorking = useRef<boolean>(true)
  const isDraggingRef = useRef(false)

  useEffect(() => {
    if (!isReady) return
    setCurrentQuizIndex(startQuizNo)
    setTryCount(startTryCount)
    studentAnswer.setStudentAnswers(recordedData, quizAnswerCount)
    heart.setMax(quizAnswerCount)
    heart.setCurrent(
      quizAnswerCount - pendingQuizTryCount(recordedData, quizAnswerCount),
    )
    isWorking.current = false
  }, [isReady])

  useEffect(() => {
    if (!isReady) return
    setSelectedIds([])
    setCheckState('idle')
    setShowCorrectAnswer(false)
    isWorking.current = false
  }, [currentQuizIndex])

  // 헤더 Q 번호 화면 동기화 — currentQuizIndex 를 컨테이너로 전달
  useEffect(() => {
    props.onActiveQuizChange?.(currentQuizIndex)
  }, [currentQuizIndex, props])

  const currentMeta = isReady ? getQuizMeta(currentQuizIndex) : null

  const shuffledOptions = useMemo<WritingActivity1Token[]>(() => {
    if (!currentMeta) return []
    // 리뷰 미통과 유저도 재풀이를 위해 셔플한다. 리뷰 통과는 원문 순서 그대로 노출.
    const shouldShuffle =
      (studyMode === 'student' || studyMode === 'guide' || studyMode === 'trial') || (studyMode === 'review' && !isReviewPass)
    return shouldShuffle
      ? shuffle([...currentMeta.orderedTokens])
      : currentMeta.orderedTokens
  }, [currentMeta?.quizId, studyMode, isReviewPass])

  const tokenById = useMemo(() => {
    const map = new Map<string, WritingActivity1Token>()
    if (currentMeta) {
      for (const tk of currentMeta.orderedTokens) map.set(tk.id, tk)
    }
    return map
  }, [currentMeta])

  const advanceToNext = () => {
    const nextQuizNo = currentQuizIndex + 1
    if (nextQuizNo <= totalQuiz) {
      setCurrentQuizIndex(nextQuizNo)
      setTryCount(0)
      heart.setCurrent(quizAnswerCount)
    } else {
      props.onFinishActivity()
    }
  }

  const runCheck = async (filledIds: string[]) => {
    if (isWorking.current) return
    if (!currentMeta) return
    isWorking.current = true

    const correct = filledIds.every((id, i) => {
      const token = tokenById.get(id)
      return token?.answerIndex === i
    })
    const newTryCount = tryCount + 1
    const willAdvance = correct || newTryCount >= quizAnswerCount

    if (!correct && willAdvance) {
      setShowCorrectAnswer(true)
    }
    setCheckState(correct ? 'correct' : 'incorrect')

    const selectedSentence = filledIds
      .map((id) => tokenById.get(id)?.text ?? '')
      .filter(Boolean)
      .join(' ')

    const answerData: IScoreBoardData = {
      quizNo: currentMeta.quizNo,
      maxCount: quizAnswerCount,
      answerCount: newTryCount,
      ox: correct,
    }

    const userAnswer = studentAnswer.makeUserAnswerData({
      mobile: '',
      studyId: props.studyId,
      studentHistoryId: props.studentHistoryId,
      bookType: props.bookType,
      step: props.currentStep,
      quizId: currentMeta.quizId,
      quizNo: currentMeta.quizNo,
      currentQuizNo: currentMeta.quizNo,
      correct: currentMeta.correctText,
      selectedAnswer: selectedSentence,
      tryCount: newTryCount,
      maxQuizCount: quizAnswerCount,
      quizLength: totalQuiz,
      isCorrect: correct,
      answerData,
      isFinishStudy: props.lastStep === props.currentStep,
    })

    try {
      const res = await saveUserAnswer(studyMode, userAnswer)
      captureFinishStudyInfoFromResult(res)
      if (Number(res.result) !== 0) {
        setCheckState('idle')
        setSelectedIds([])
        setShowCorrectAnswer(false)
        isWorking.current = false
        return
      }
    } catch {
      setCheckState('idle')
      setSelectedIds([])
      setShowCorrectAnswer(false)
      isWorking.current = false
      return
    }

    studentAnswer.addStudentAnswer(answerData)
    const tempRecord: IRecordAnswerType = {
      QuizId: `${currentMeta.quizId}`,
      QuizNo: currentMeta.quizNo,
      CurrentQuizNo: currentMeta.quizNo,
      OX: correct ? '1' : '2',
      TempText: '',
      PenaltyWord: '',
      Correct: currentMeta.correctText,
      StudentAnswer: selectedSentence,
      AnswerCount: newTryCount,
    }
    props.onUpdateRecord?.(tempRecord)
    if (!correct) {
      heart.decrease()
    }

    const finalize = () => {
      if (willAdvance) {
        playAudioBeforeContinue(currentMeta.sound, advanceToNext)
      } else {
        setSelectedIds([])
        setCheckState('idle')
        setTryCount(newTryCount)
        isWorking.current = false
      }
    }

    if (quizFeedback) {
      quizFeedback.presentResult(correct, finalize)
    } else {
      finalize()
    }
  }

  useEffect(() => {
    if (!isReady || !currentMeta) return
    if (checkState !== 'idle') return
    if (selectedIds.length !== currentMeta.slotCount) return

    const timer = setTimeout(() => {
      if (isDraggingRef.current) return
      runCheck(selectedIds)
    }, 600)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runCheck 는 매 렌더 새 함수
  }, [selectedIds, currentMeta?.slotCount, checkState, isReady])

  const slotCount = currentMeta?.slotCount ?? 0
  const isChecked = checkState !== 'idle'
  const isCorrect = checkState === 'correct'
  const isIncorrect = checkState === 'incorrect'
  const isAllSlotsFilled = selectedIds.length === slotCount

  const handleOptionClick = (token: WritingActivity1Token) => {
    if (isWorking.current) return
    if (isChecked || isAllSlotsFilled) return
    if (selectedIds.includes(token.id)) return
    setSelectedIds((prev) => [...prev, token.id])
  }

  const handleSlotClick = (index: number) => {
    if (isWorking.current) return
    if (isChecked) return
    if (!selectedIds[index]) return
    setSelectedIds((prev) => [
      ...prev.slice(0, index),
      ...prev.slice(index + 1),
    ])
  }

  const handleSlotReorder = (fromIndex: number, toIndex: number) => {
    if (isWorking.current || isChecked) return
    if (fromIndex === toIndex) return
    setSelectedIds((prev) => {
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= prev.length ||
        toIndex >= prev.length
      ) {
        return prev
      }
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
  }

  const handleSlotDragStart = () => {
    isDraggingRef.current = true
  }

  const handleSlotDragEnd = () => {
    isDraggingRef.current = false
  }

  return {
    currentMeta,
    currentQuizIndex,
    tryCount,
    shuffledOptions,
    tokenById,
    slotCount,
    isChecked,
    isCorrect,
    isIncorrect,
    isAllSlotsFilled,
    selectedIds,
    showCorrectAnswer,
    handleOptionClick,
    handleSlotClick,
    handleSlotReorder,
    handleSlotDragStart,
    handleSlotDragEnd,
  }
}
