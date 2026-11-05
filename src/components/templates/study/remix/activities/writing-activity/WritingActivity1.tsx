import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import shuffle from 'lodash/shuffle'
import { useTranslation } from 'react-i18next'
import { keyframes, styled } from 'styled-components'

import { IconArrowUp } from '@components/atoms/common/icons/IconArrowUp'
import TextBox from '@components/atoms/common/TextBox'
import QuizComment from '@components/atoms/study/comments/QuizComment'
import { resolveQuizSelectableFeedback } from '@components/atoms/study/feedback/QuizSelectableFeedbackFoundation'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import {
  WritingActivity1SentenceRow,
  WritingActivity1SlotBox,
} from '@components/molecules/study/activities/writing-activity-01/WritingActivity1Slots'
import QuestionSoundButton from '@components/molecules/study/question/QuestionSoundButton'
import { WritingWordBankCardBox } from '@components/molecules/study/quizOptions/cards/WritingWordBankCardBox'
import { useQuizFeedbackOptional } from '@contexts/QuizFeedbackContext'
import type { AugmentOptions } from '@hooks/study/remix/useAugmentManager'
import { BaseQuiz } from '@hooks/study/remix/useQuizManager'
import { useWritingActivity1SlotInteraction } from '@hooks/study/useWritingActivity1SlotInteraction'
import { ACTIVITY_INSTRUCTIONS } from '@src/constants/study/activityInstructions'

type WritingActivity1Props = {
  augmentOptions: AugmentOptions
  quizData: BaseQuiz
  onComplete: (isCorrect: boolean) => void
}

type CardToken = {
  id: string
  text: string
  answerIndex: number
}

/** Examples 항목에서 텍스트를 안전하게 추출 */
function extractText(example: unknown): string {
  if (example && typeof example === 'object' && 'Text' in example) {
    return String((example as { Text: unknown }).Text)
  }
  return String(example)
}

function resolveAnswerOrder(
  questionText: string,
  cardTexts: string[],
): number[] {
  let remaining = questionText.trim()
  const answerSequence: string[] = []

  while (remaining.length > 0) {
    remaining = remaining.trimStart()
    if (!remaining) break

    const sortedTexts = [...cardTexts].sort((a, b) => b.length - a.length)
    const matched = sortedTexts.find((t) => remaining.startsWith(t))

    if (matched) {
      answerSequence.push(matched)
      remaining = remaining.slice(matched.length)
    } else {
      remaining = remaining.slice(1)
    }
  }

  const usedPositions = new Set<number>()
  return cardTexts.map((text) => {
    for (let i = 0; i < answerSequence.length; i++) {
      if (answerSequence[i] === text && !usedPositions.has(i)) {
        usedPositions.add(i)
        return i
      }
    }
    return -1
  })
}

export default function WritingActivity1({
  augmentOptions,
  quizData,
  onComplete,
}: WritingActivity1Props) {
  const { t } = useTranslation()
  const quizFeedback = useQuizFeedbackOptional()

  const { orderedTokens, shuffledOptions, slotCount } = useMemo(() => {
    const questionText = quizData.Question.Text
    const cardTexts = quizData.Examples.map(extractText)
    const answerIndices = resolveAnswerOrder(questionText, cardTexts)

    const tokens: CardToken[] = cardTexts.map((text, i) => ({
      id: `opt_${i}`,
      text,
      answerIndex: answerIndices[i],
    }))

    return {
      orderedTokens: tokens,
      shuffledOptions: shuffle([...tokens]),
      slotCount: tokens.length,
    }
  }, [quizData.QuizId, quizData.Question.Text, quizData.Examples])

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [checkState, setCheckState] = useState<
    'idle' | 'correct' | 'incorrect'
  >('idle')

  const isChecked = checkState !== 'idle'
  const isCorrect = checkState === 'correct'
  const isIncorrect = checkState === 'incorrect'
  const isCompleted = selectedIds.length === slotCount

  const tokenById = useMemo(
    () => new Map(orderedTokens.map((t) => [t.id, t])),
    [orderedTokens],
  )

  const isOptionSelected = useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds],
  )

  const handleOptionClick = useCallback(
    (token: CardToken) => {
      if (isChecked || isCompleted || isOptionSelected(token.id)) return
      setSelectedIds((prev) => [...prev, token.id])
    },
    [isChecked, isCompleted, isOptionSelected],
  )

  const handleSlotClick = useCallback(
    (index: number) => {
      if (isChecked || !selectedIds[index]) return
      setSelectedIds((prev) => [
        ...prev.slice(0, index),
        ...prev.slice(index + 1),
      ])
    },
    [isChecked, selectedIds],
  )

  const handleSlotReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (isChecked || fromIndex === toIndex) return
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
    },
    [isChecked],
  )

  const isDraggingRef = useRef(false)

  const { getSlotProps, isHolding } = useWritingActivity1SlotInteraction({
    selectedCount: selectedIds.length,
    isChecked,
    onReorder: handleSlotReorder,
    onRemove: handleSlotClick,
    onDragStart: () => {
      isDraggingRef.current = true
    },
    onDragEnd: () => {
      isDraggingRef.current = false
    },
  })

  useEffect(() => {
    if (!isCompleted || isChecked || isHolding) return

    const timer = window.setTimeout(() => {
      if (isDraggingRef.current) return
      const correct = selectedIds.every((id, i) => {
        const token = tokenById.get(id)
        return token?.answerIndex === i
      })
      setCheckState(correct ? 'correct' : 'incorrect')
      onComplete(correct)
    }, 600)

    return () => window.clearTimeout(timer)
  }, [isCompleted, isChecked, isHolding, selectedIds, tokenById, onComplete])

  return (
    <>
      <QuestionSoundButton
        soundUrl={quizData.Question.Sound}
        augmentOptions={augmentOptions}
        forceEnable={false}
      />

      <QuizBody>
        <QuizComment>{t(ACTIVITY_INSTRUCTIONS.WRITING_ACTIVITY1)}</QuizComment>

        <MainContentBox>
          <SentenceAreaContainer
            $isCompleted={isCompleted}
            $isCorrect={isCorrect}
            $isIncorrect={isIncorrect}
          >
            <WritingActivity1SentenceRow $isCorrect={isCorrect}>
              {Array.from({ length: slotCount }).map((_, i) => {
                const token = selectedIds[i]
                  ? tokenById.get(selectedIds[i])
                  : undefined
                return (
                  <WritingActivity1SlotBox
                    key={i}
                    $filled={!!token}
                    $isNext={
                      !isChecked && !isCompleted && selectedIds.length === i
                    }
                    $isChecked={isChecked}
                    $isIncorrect={isIncorrect}
                    $clickable={!isChecked && !!token}
                    $isCompleted={isCompleted}
                    {...getSlotProps(i, !!token)}
                  >
                    <TextBox
                      fontSize={isCorrect ? 1.6 : 1.3}
                      fontWeight={600}
                      color='primary'
                    >
                      {token?.text ?? '\u00A0'}
                    </TextBox>
                  </WritingActivity1SlotBox>
                )
              })}
            </WritingActivity1SentenceRow>
          </SentenceAreaContainer>

          {!isCompleted && (
            <>
              <Divider>
                <div className='line' />
                <div className='arrow-up'>
                  <IconArrowUp alt='arrow-up' />
                </div>
                <div className='line' />
              </Divider>

              <OptionCardsArea>
                {shuffledOptions.map((token) => {
                  const selected = isOptionSelected(token.id)
                  return (
                    <WritingWordBankCardBox
                      key={token.id}
                      $isEmpty={selected}
                      $pressed={false}
                      onClick={() => handleOptionClick(token)}
                      disabled={isChecked || selected}
                    >
                      {selected ? (
                        '\u00A0'
                      ) : (
                        <TextBox
                          fontSize={1.3}
                          fontWeight={600}
                          color='primary'
                        >
                          {token.text}
                        </TextBox>
                      )}
                    </WritingWordBankCardBox>
                  )
                })}
              </OptionCardsArea>
            </>
          )}
        </MainContentBox>
      </QuizBody>
    </>
  )
}

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
`

const MainContentBox = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: 0;
`

const FeedbackBanner = styled.div<{ $isCorrect: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 12px;
  margin-bottom: 10px;
  animation: ${slideDown} 0.25s ease;
  background: ${({ $isCorrect }) =>
    $isCorrect ? 'rgba(52, 199, 89, 0.12)' : 'rgba(255, 59, 48, 0.12)'};
  border: 1.5px solid
    ${({ $isCorrect }) =>
      $isCorrect ? 'rgba(52, 199, 89, 0.5)' : 'rgba(255, 59, 48, 0.5)'};
`

const FeedbackIcon = styled.span`
  font-size: 1.2rem;
  font-weight: 700;
`

const FeedbackText = styled.span`
  font-size: 0.95rem;
  font-weight: 600;
`

const SentenceAreaContainer = styled.div<{
  $isCompleted?: boolean
  $isCorrect?: boolean
  $isIncorrect?: boolean
}>`
  flex: 0 1 auto;
  display: flex;
  align-items: center;
  justify-content: ${({ $isCompleted, $isCorrect }) =>
    $isCompleted && $isCorrect ? 'center' : 'flex-start'};
  padding: 14px 16px;
  border-radius: 25px;
  border: ${(props) =>
    resolveQuizSelectableFeedback({
      $isCorrect: props.$isCorrect,
      $isIncorrect: props.$isIncorrect,
    }).border};
  background: ${(props) =>
    resolveQuizSelectableFeedback({
      $isCorrect: props.$isCorrect,
      $isIncorrect: props.$isIncorrect,
    }).bg};
  min-height: 120px;
`

const Divider = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
  gap: 12px;

  .line {
    width: 100%;
    height: 1px;
    border-bottom: 1px dashed #fff;
  }

  .arrow-up {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      display: block;
      width: 100%;
      height: 100%;
    }
  }
`

const OptionCardsArea = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  padding: 8px 0;
  overflow-y: auto;
`
