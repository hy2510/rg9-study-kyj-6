/**
 * Practice B3 — 영단어·한글 뜻 짝 맞추기
 * - 스텝당 5쌍 한 화면, 정답 시 카드 locked 후 완료
 */
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

import { media } from '@styles/tokens/breakpoints'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import QuizComment from '@components/atoms/study/comments/QuizComment'
import QuizCorrectConfettiLayer from '@components/atoms/study/feedback/QuizCorrectConfettiLayer'
import { quizSelectablePressedStyle } from '@components/atoms/study/feedback/QuizSelectableFeedbackFoundation'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import { GridQuizOptionCardBox } from '@components/molecules/study/quizOptions/cards/GridQuizOptionCardBox'
import { ACTIVITY_INSTRUCTIONS } from '@constants/study/activityInstructions'
import { useWordPracticeScoreOptional } from '@contexts/WordPracticeScoreContext'
import { useIncorrectSoundPlayer } from '@hooks/study/useIncorrectSoundPlayer'
import { useQuizContainerShake } from '@hooks/study/useQuizContainerShake'
import { useQuizCorrectCelebration } from '@hooks/study/useQuizCorrectCelebration'
import type { WordMeaningPracticeItem } from '@interfaces/study/word-practice/wordMeaningPractice'
import { WORD_PRACTICE_B_QUESTIONS_PER_STEP } from '@src/constants/study/word-practice/wordPracticeTrackBConfig'

const MATCH_GOAL = WORD_PRACTICE_B_QUESTIONS_PER_STEP
const COMPLETE_HOLD_MS = 1500
const WRONG_FEEDBACK_MS = 900

type SlotState = 'idle' | 'selected' | 'matched' | 'locked'

type MatchSlot = {
  item: WordMeaningPracticeItem
  state: SlotState
}

type MatchBoardState = {
  leftSlots: MatchSlot[]
  rightSlots: MatchSlot[]
}

type PracticeB3Props = {
  items: WordMeaningPracticeItem[]
  initialIndex?: number
  onComplete?: () => void
  onProgressChange?: (current: number, total: number) => void
}

function shuffleArray<T>(values: T[]): T[] {
  const shuffled = [...values]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function createMatchBoard(items: WordMeaningPracticeItem[]): MatchBoardState {
  const shuffled = shuffleArray(items)

  return {
    leftSlots: shuffled.map((item) => ({ item, state: 'idle' })),
    rightSlots: shuffleArray(shuffled).map((item) => ({
      item,
      state: 'idle',
    })),
  }
}

export default function PracticeB3({
  items,
  initialIndex = 0,
  onComplete,
  onProgressChange,
}: PracticeB3Props) {
  const { t } = useTranslation()
  const wordPracticeScore = useWordPracticeScoreOptional()
  const [{ leftSlots, rightSlots }, setBoard] = useState(() =>
    createMatchBoard(items),
  )
  const [matchedCount, setMatchedCount] = useState(
    Math.min(initialIndex, MATCH_GOAL),
  )
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null)
  const [selectedRight, setSelectedRight] = useState<number | null>(null)
  const [isComplete, setIsComplete] = useState(initialIndex >= MATCH_GOAL)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [wrongPair, setWrongPair] = useState<{
    left: number
    right: number
  } | null>(null)
  const feedbackTimerRef = useRef<number | null>(null)
  const pendingCompleteOnBurstEndRef = useRef(false)
  const { confettiBurstKey, trigger, clearConfetti } =
    useQuizCorrectCelebration()
  const { triggerShake } = useQuizContainerShake()
  const { play: playIncorrectSound } = useIncorrectSoundPlayer()

  const clearFeedbackTimer = useCallback(() => {
    if (feedbackTimerRef.current !== null) {
      window.clearTimeout(feedbackTimerRef.current)
      feedbackTimerRef.current = null
    }
  }, [])

  const lockAllMatchedSlots = useCallback(() => {
    setBoard((prev) => ({
      leftSlots: prev.leftSlots.map((slot) =>
        slot.state === 'matched' ? { ...slot, state: 'locked' } : slot,
      ),
      rightSlots: prev.rightSlots.map((slot) =>
        slot.state === 'matched' ? { ...slot, state: 'locked' } : slot,
      ),
    }))
    setSelectedLeft(null)
    setSelectedRight(null)
    setIsEvaluating(false)
  }, [])

  const lockAllMatchedSlotsRef = useRef(lockAllMatchedSlots)
  useLayoutEffect(() => {
    lockAllMatchedSlotsRef.current = lockAllMatchedSlots
  })

  const handleConfettiBurstEnd = useCallback(() => {
    clearConfetti()
    lockAllMatchedSlotsRef.current()

    if (!pendingCompleteOnBurstEndRef.current) return

    pendingCompleteOnBurstEndRef.current = false
    setIsComplete(true)
    feedbackTimerRef.current = window.setTimeout(() => {
      onComplete?.()
    }, COMPLETE_HOLD_MS)
  }, [clearConfetti, onComplete])

  const handleMatchSuccess = useCallback(
    (leftIndex: number, rightIndex: number) => {
      setBoard((prev) => ({
        ...prev,
        leftSlots: prev.leftSlots.map((slot, index) =>
          index === leftIndex ? { ...slot, state: 'matched' } : slot,
        ),
        rightSlots: prev.rightSlots.map((slot, index) =>
          index === rightIndex ? { ...slot, state: 'matched' } : slot,
        ),
      }))

      const nextMatchedCount = matchedCount + 1
      setMatchedCount(nextMatchedCount)
      if (nextMatchedCount >= MATCH_GOAL) {
        pendingCompleteOnBurstEndRef.current = true
      }
      trigger()
    },
    [matchedCount, trigger],
  )

  const handleMatchFailure = useCallback(
    (leftIndex: number, rightIndex: number) => {
      playIncorrectSound()
      triggerShake()
      setWrongPair({ left: leftIndex, right: rightIndex })

      feedbackTimerRef.current = window.setTimeout(() => {
        setWrongPair(null)
        setSelectedLeft(null)
        setSelectedRight(null)
        setBoard((prev) => ({
          ...prev,
          leftSlots: prev.leftSlots.map((slot) =>
            slot.state === 'selected' ? { ...slot, state: 'idle' } : slot,
          ),
          rightSlots: prev.rightSlots.map((slot) =>
            slot.state === 'selected' ? { ...slot, state: 'idle' } : slot,
          ),
        }))
        setIsEvaluating(false)
      }, WRONG_FEEDBACK_MS)
    },
    [playIncorrectSound, triggerShake],
  )

  const evaluateSelection = useCallback(
    (leftIndex: number, rightIndex: number) => {
      setIsEvaluating(true)
      const leftWord = leftSlots[leftIndex]?.item.word
      const rightWord = rightSlots[rightIndex]?.item.word

      if (leftWord && rightWord && leftWord === rightWord) {
        wordPracticeScore?.recordMatchFirstAttempt([leftWord], true)
        handleMatchSuccess(leftIndex, rightIndex)
        return
      }

      if (leftWord && rightWord) {
        wordPracticeScore?.recordMatchFirstAttempt([leftWord, rightWord], false)
      }

      setBoard((prev) => ({
        ...prev,
        leftSlots: prev.leftSlots.map((slot, index) =>
          index === leftIndex ? { ...slot, state: 'selected' } : slot,
        ),
        rightSlots: prev.rightSlots.map((slot, index) =>
          index === rightIndex ? { ...slot, state: 'selected' } : slot,
        ),
      }))
      handleMatchFailure(leftIndex, rightIndex)
    },
    [
      handleMatchFailure,
      handleMatchSuccess,
      leftSlots,
      rightSlots,
      wordPracticeScore,
    ],
  )

  const handleLeftClick = (index: number) => {
    if (isComplete || isEvaluating) return
    const slot = leftSlots[index]
    if (!slot || slot.state === 'locked' || slot.state === 'matched') return

    clearFeedbackTimer()

    if (selectedLeft === index) {
      setSelectedLeft(null)
      setBoard((prev) => ({
        ...prev,
        leftSlots: prev.leftSlots.map((current, currentIndex) =>
          currentIndex === index ? { ...current, state: 'idle' } : current,
        ),
      }))
      return
    }

    const nextRight = selectedRight
    setSelectedLeft(index)
    setBoard((prev) => ({
      ...prev,
      leftSlots: prev.leftSlots.map((current, currentIndex) => {
        if (currentIndex === index) {
          return { ...current, state: 'selected' }
        }
        if (current.state === 'selected') {
          return { ...current, state: 'idle' }
        }
        return current
      }),
    }))

    if (nextRight !== null) {
      evaluateSelection(index, nextRight)
    }
  }

  const handleRightClick = (index: number) => {
    if (isComplete || isEvaluating) return
    const slot = rightSlots[index]
    if (!slot || slot.state === 'locked' || slot.state === 'matched') return

    clearFeedbackTimer()

    if (selectedRight === index) {
      setSelectedRight(null)
      setBoard((prev) => ({
        ...prev,
        rightSlots: prev.rightSlots.map((current, currentIndex) =>
          currentIndex === index ? { ...current, state: 'idle' } : current,
        ),
      }))
      return
    }

    const nextLeft = selectedLeft
    setSelectedRight(index)
    setBoard((prev) => ({
      ...prev,
      rightSlots: prev.rightSlots.map((current, currentIndex) => {
        if (currentIndex === index) {
          return { ...current, state: 'selected' }
        }
        if (current.state === 'selected') {
          return { ...current, state: 'idle' }
        }
        return current
      }),
    }))

    if (nextLeft !== null) {
      evaluateSelection(nextLeft, index)
    }
  }

  useEffect(() => {
    onProgressChange?.(matchedCount, MATCH_GOAL)
  }, [matchedCount, onProgressChange])

  useEffect(() => {
    return () => {
      clearFeedbackTimer()
    }
  }, [clearFeedbackTimer])

  const getCardProps = (
    slot: MatchSlot,
    index: number,
    side: 'left' | 'right',
    isSelected: boolean,
  ) => {
    const isCompleted = slot.state === 'locked'
    const isMatchedFeedback = slot.state === 'matched'
    const isIncorrect =
      wrongPair !== null &&
      ((side === 'left' && wrongPair.left === index) ||
        (side === 'right' && wrongPair.right === index))

    return {
      $isSelected:
        isSelected && !isIncorrect && !isMatchedFeedback && !isCompleted,
      $pressed:
        (isSelected && !isIncorrect) || isMatchedFeedback || isCompleted,
      $isCorrect: isMatchedFeedback,
      $isCompleted: isCompleted,
      $isIncorrect: isIncorrect,
      disabled: isCompleted || isEvaluating || isMatchedFeedback || isComplete,
    }
  }

  return (
    <QuizCorrectConfettiLayer
      burstKey={confettiBurstKey}
      onBurstEnd={handleConfettiBurstEnd}
    >
      <QuizBody>
        <QuizComment>{t(ACTIVITY_INSTRUCTIONS.PRACTICE_B3)}</QuizComment>

        <MatchBoard>
          {leftSlots.map((leftSlot, index) => {
            const rightSlot = rightSlots[index]
            const leftCardProps = getCardProps(
              leftSlot,
              index,
              'left',
              selectedLeft === index,
            )
            const rightCardProps = getCardProps(
              rightSlot,
              index,
              'right',
              selectedRight === index,
            )

            return (
              <MatchBoardRow key={`match-row-${index}`}>
                <MatchOptionCard
                  key={`left-${index}-${leftSlot.item.word}`}
                  $isInGrid
                  {...leftCardProps}
                  onClick={() => handleLeftClick(index)}
                  aria-label={leftSlot.item.meaning}
                  aria-pressed={
                    selectedLeft === index ||
                    leftCardProps.$isCorrect ||
                    leftCardProps.$isCompleted
                  }
                >
                  <MeaningLabel
                    $isIncorrect={leftCardProps.$isIncorrect}
                    $isCompleted={leftCardProps.$isCompleted}
                  >
                    {leftSlot.item.meaning}
                  </MeaningLabel>
                </MatchOptionCard>

                <MatchOptionCard
                  key={`right-${index}-${rightSlot.item.word}`}
                  $isInGrid
                  {...rightCardProps}
                  onClick={() => handleRightClick(index)}
                  aria-label={rightSlot.item.word}
                  aria-pressed={
                    selectedRight === index ||
                    rightCardProps.$isCorrect ||
                    rightCardProps.$isCompleted
                  }
                >
                  <WordLabel
                    $isIncorrect={rightCardProps.$isIncorrect}
                    $isCompleted={rightCardProps.$isCompleted}
                  >
                    {rightSlot.item.word}
                  </WordLabel>
                </MatchOptionCard>
              </MatchBoardRow>
            )
          })}
        </MatchBoard>
      </QuizBody>
    </QuizCorrectConfettiLayer>
  )
}

const MatchBoard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`

const MatchBoardRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
  width: 100%;
  align-items: stretch;

  ${media.mobile} {
    gap: 8px;
  }
`

const MatchOptionCard = styled(GridQuizOptionCardBox).attrs({
  $isInGrid: true,
})<{
  $isSelected?: boolean
  $isCompleted?: boolean
}>`
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 60px;
  text-align: center;
  width: 100%;

  ${media.mobile} {
    min-height: 44px;
  }

  ${({ $isSelected, $isCorrect, $isIncorrect, $isCompleted }) =>
    $isSelected &&
    !$isCorrect &&
    !$isIncorrect &&
    !$isCompleted &&
    css`
      border: 1.5px solid #3c4b62;
      box-shadow: none;
    `}

  ${({ $isIncorrect }) =>
    $isIncorrect &&
    css`
      box-shadow: none;
    `}

  ${({ $isCompleted }) =>
    $isCompleted &&
    css`
      background: #f4f6f8;
      border: 1.5px solid #d4dce6;
      cursor: default;
      ${quizSelectablePressedStyle}
    `}

  &:disabled {
    cursor: default;
  }
`

const MeaningLabel = styled.span<{
  $isIncorrect?: boolean
  $isCompleted?: boolean
}>`
  font-family: 'Rg-B', sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.2;
  color: ${({ $isIncorrect, $isCompleted }) =>
    $isIncorrect ? '#ef3d2e' : $isCompleted ? '#a2b1c4' : '#3c4b62'};

  ${media.mobile} {
    font-size: 18px;
  }
`

const WordLabel = styled.span<{
  $isIncorrect?: boolean
  $isCompleted?: boolean
}>`
  font-family: 'Rg-B', sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.2;
  color: ${({ $isIncorrect, $isCompleted }) =>
    $isIncorrect ? '#ef3d2e' : $isCompleted ? '#a2b1c4' : '#3c4b62'};

  ${media.mobile} {
    font-size: 16px;
  }
`
