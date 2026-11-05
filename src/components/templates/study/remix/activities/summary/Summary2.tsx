import { useCallback, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { styled } from 'styled-components'

import { IconArrowUp } from '@components/atoms/common/icons/IconArrowUp'
import TextBox from '@components/atoms/common/TextBox'
import QuizComment from '@components/atoms/study/comments/QuizComment'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import {
  Summary2BlankSlot,
  Summary2SentenceText,
} from '@components/molecules/study/activities/summary-02/Summary2Slots'
import { StudySummaryOptionCardButton } from '@components/molecules/study/quizOptions/cards/StudySummaryOptionCardButton'
import { useQuizFeedbackOptional } from '@contexts/QuizFeedbackContext'
import { useSummary2DelayedScroll } from '@hooks/study/remix/useSummary2DelayedScroll'
import { ACTIVITY_INSTRUCTIONS } from '@src/constants/study/activityInstructions'
import type { ISummary2Quiz } from '@src/interfaces/study/ISummary'

type Summary2Props = {
  quizData?: ISummary2Quiz[]
  onComplete?: () => void
}

export default function Summary2({ quizData, onComplete }: Summary2Props) {
  const { t } = useTranslation()
  const quizFeedback = useQuizFeedbackOptional()

  const quizItems: ISummary2Quiz[] =
    quizData && quizData.length > 0 ? quizData : []

  // 정답 순서: QuizNo 기준 (exhausted, decided, wandered, discovered, mysterious, cautiously, ancient, whispered, Suddenly, treasure)
  const correctOrder = [...quizItems]
    .sort((a, b) => a.QuizNo - b.QuizNo)
    .map((q) => q.QuizId)

  // 문장을 ___ 기준으로 분할 (빈칸 개수 = parts.length - 1)
  const sentenceSource =
    (quizData as any)?.Sentence?.Texts ??
    (quizItems[0] as any)?.Sentence?.Texts ??
    ''
  const sentenceParts = String(sentenceSource).split('[]')
  const blankCount = Math.max(sentenceParts.length - 1, 1)

  // 상단: 선택된 답안들 (순서대로)
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([])

  // 하단: 아직 선택하지 않은 보기들
  const [availableOptions, setAvailableOptions] = useState<string[]>(
    quizItems.map((q) => q.QuizId),
  )

  // 오답 피드백
  const [incorrectAnswer, setIncorrectAnswer] = useState<string | null>(null)
  const [isCheckingAnswer, setIsCheckingAnswer] = useState(false)
  // 클릭된 옵션 (pressed + correct/incorrect 피드백 표시용)
  const [pressedOptionId, setPressedOptionId] = useState<string | null>(null)

  const isCompleted = selectedAnswers.length === blankCount
  const nextSlotRef = useRef<HTMLSpanElement>(null)
  const answerAreaScrollRef = useRef<HTMLDivElement>(null)
  const handleScrollComplete = useCallback(
    (optionIdToRemove: string | null) => {
      if (optionIdToRemove) {
        setAvailableOptions((prev) =>
          prev.filter((id) => id !== optionIdToRemove),
        )
        setPressedOptionId(null)
      }
      setIsCheckingAnswer(false)
    },
    [],
  )

  const { trigger, setPendingRemovalId } = useSummary2DelayedScroll({
    scrollContainerRef: answerAreaScrollRef,
    targetRef: nextSlotRef,
    delayMs: quizFeedback ? 0 : 1000,
    windowTargetYRatio: 0.4,
    selectedAnswersLength: selectedAnswers.length,
    blankCount,
    onComplete,
    onScrollComplete: handleScrollComplete,
  })

  const getQuizText = (quizId: string): string => {
    const quiz = quizItems.find((q) => q.QuizId === quizId)
    return quiz?.Examples.map((e) => e.Text).join('') || ''
  }

  const handleOptionClick = (quizId: string) => {
    if (isCheckingAnswer) return

    setIsCheckingAnswer(true)
    setPressedOptionId(quizId)
    const currentIndex = selectedAnswers.length

    if (correctOrder[currentIndex] === quizId) {
      setIncorrectAnswer(null)
      setSelectedAnswers((prev) => [...prev, quizId])
      setPendingRemovalId(quizId)
      const runTrigger = () => trigger()
      if (quizFeedback) {
        quizFeedback.presentResult(true, runTrigger)
      } else {
        runTrigger()
      }
    } else {
      setIncorrectAnswer(quizId)
      const clearWrong = () => {
        setIncorrectAnswer(null)
        setPressedOptionId(null)
        setIsCheckingAnswer(false)
      }
      if (quizFeedback) {
        quizFeedback.presentResult(false, clearWrong)
      } else {
        clearWrong()
      }
    }
  }

  return (
    <QuizBody>
      <QuizComment>{t(ACTIVITY_INSTRUCTIONS.SUMMARY2)}</QuizComment>

      <MainContentBox>
        <AnswerAreaContainer $isCompleted={isCompleted}>
          <AnswerAreaScroll
            ref={answerAreaScrollRef}
            $isCompleted={isCompleted}
          >
            <Summary2SentenceText>
              {sentenceParts.map((part: string, i: number) => (
                <span key={i}>
                  {part}
                  {i < blankCount && (
                    <Summary2BlankSlot
                      ref={
                        !isCompleted && selectedAnswers.length === i
                          ? nextSlotRef
                          : undefined
                      }
                      $filled={!!selectedAnswers[i]}
                      $isNext={!isCompleted && selectedAnswers.length === i}
                    >
                      {selectedAnswers[i]
                        ? getQuizText(selectedAnswers[i])
                        : '\u00A0'}
                    </Summary2BlankSlot>
                  )}
                </span>
              ))}
            </Summary2SentenceText>
          </AnswerAreaScroll>
        </AnswerAreaContainer>

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
              {availableOptions.map((quizId) => (
                <StudySummaryOptionCardButton
                  key={quizId}
                  $pressed={pressedOptionId === quizId}
                  $isCorrect={
                    pressedOptionId === quizId &&
                    selectedAnswers.length > 0 &&
                    correctOrder[selectedAnswers.length - 1] === quizId
                  }
                  $isIncorrect={incorrectAnswer === quizId}
                  onClick={() => handleOptionClick(quizId)}
                  disabled={isCheckingAnswer}
                >
                  <TextBox
                    fontSize={1.1}
                    fontWeight={600}
                    color='primary'
                    style={{ textAlign: 'left', width: '100%' }}
                  >
                    {getQuizText(quizId)}
                  </TextBox>
                </StudySummaryOptionCardButton>
              ))}
            </OptionCardsArea>
          </>
        )}
      </MainContentBox>
    </QuizBody>
  )
}

const MainContentBox = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: 0;
`

const AnswerAreaContainer = styled.div<{ $isCompleted?: boolean }>`
  flex: 0 1 auto;
  min-height: 0;
  max-height: ${(props) => (props.$isCompleted ? 'none' : '45%')};
  display: flex;
  flex-direction: column;
  padding: 14px 16px;
  border-radius: 24px;
  border: 1.5px solid #e9edf3;
  background: #fff;
`

const AnswerAreaScroll = styled.div<{ $isCompleted?: boolean }>`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
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
    border-bottom: 1px dashed #a2b1c4;
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
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  overflow-y: auto;
  padding-bottom: 4px;
`
