import { useEffect, useMemo, useRef, useState } from 'react'

import { media } from '@styles/tokens/breakpoints'
import { useTranslation } from 'react-i18next'
import { styled } from 'styled-components'

import { IconArrowUp } from '@components/atoms/common/icons/IconArrowUp'
import { IconSoundPlay } from '@components/atoms/common/icons/IconSoundPlay'
import { IconSoundStop } from '@components/atoms/common/icons/IconSoundStop'
import TextBox from '@components/atoms/common/TextBox'
import QuizComment from '@components/atoms/study/comments/QuizComment'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import { Summary1SlotContentBox } from '@components/molecules/study/activities/summary-01/Summary1Slot'
import {
  NextQuestionButton,
  NextQuestionButtonWrap,
} from '@components/molecules/study/question/NextQuestionButton'
import { StudySummaryOptionCardButton } from '@components/molecules/study/quizOptions/cards/StudySummaryOptionCardButton'
import { useQuizFeedbackOptional } from '@contexts/QuizFeedbackContext'
import { BaseQuiz } from '@hooks/study/remix/useQuizManager'
import { useSummary1SequentialAudio } from '@hooks/study/remix/useSummary1SequentialAudio'
import { ACTIVITY_INSTRUCTIONS } from '@src/constants/study/activityInstructions'

type Summary1Props = {
  quizData: BaseQuiz[]
  onComplete: () => void
}

export default function Summary1({ quizData, onComplete }: Summary1Props) {
  const { t } = useTranslation()
  const quizFeedback = useQuizFeedbackOptional()

  // 정답 순서: QuizNo 기준으로 정렬된 원본 순서
  const orderedQuizzes = useMemo(
    () => [...quizData].sort((a, b) => a.QuizNo - b.QuizNo),
    [quizData],
  )
  const correctOrder = orderedQuizzes.map((q) => q.QuizId)

  const soundUrlsOrdered = useMemo(
    () => orderedQuizzes.map((q) => (q.Question?.Sound ?? '').trim()),
    [orderedQuizzes],
  )

  const {
    playingIndex,
    isPlaying,
    toggle: toggleSequentialAudio,
    stop: stopSequentialAudio,
  } = useSummary1SequentialAudio(soundUrlsOrdered)

  // 상단: 선택된 답안들 (순서대로)
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([])

  // 하단: 아직 선택하지 않은 보기들
  const [availableOptions, setAvailableOptions] = useState<string[]>(
    quizData.map((q) => q.QuizId),
  )

  // 오답 피드백
  const [incorrectAnswer, setIncorrectAnswer] = useState<string | null>(null)
  const [isCheckingAnswer, setIsCheckingAnswer] = useState(false)
  // 클릭된 옵션 (pressed + correct/incorrect 피드백 표시용)
  const [pressedOptionId, setPressedOptionId] = useState<string | null>(null)

  const isCompleted = selectedAnswers.length === quizData.length
  const answerAreaRef = useRef<HTMLDivElement>(null)
  /** 문장 목록이 스크롤되는 영역 (완료 후 맨 위·재생 따라가기) */
  const answerScrollRef = useRef<HTMLDivElement>(null)
  /** 완료 시 전체 패널(바깥 스크롤)도 맨 위로 */
  const summaryContainerRef = useRef<HTMLDivElement>(null)
  const sentenceRowRefs = useRef<(HTMLDivElement | null)[]>([])
  const nextSlotRef = useRef<HTMLDivElement>(null)

  // selectedAnswers 변경 시 빈 슬롯(다음 채울 곳)이 보이도록 스크롤
  useEffect(() => {
    if (!isCompleted && nextSlotRef.current && answerAreaRef.current) {
      nextSlotRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [selectedAnswers.length, isCompleted])

  // 퍼즐 완료 직후: 답 영역·스토리 패널을 가장 위로
  useEffect(() => {
    if (!isCompleted) return
    const scrollToTop = (el: HTMLDivElement | null) => {
      if (!el) return
      el.scrollTo({ top: 0, behavior: 'smooth' })
    }
    scrollToTop(answerScrollRef.current)
    scrollToTop(summaryContainerRef.current)
  }, [isCompleted])

  // 순차 재생 중: 현재 읽는 문장이 보이도록 스크롤
  useEffect(() => {
    if (!isCompleted || playingIndex === null) return
    const row = sentenceRowRefs.current[playingIndex]
    row?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [isCompleted, playingIndex])

  const getQuizText = (quizId: string): string => {
    const quiz = quizData.find((q) => q.QuizId === quizId)
    return quiz?.Question?.Text || ''
  }

  const handleOptionClick = (quizId: string) => {
    if (isCheckingAnswer) return

    setIsCheckingAnswer(true)
    setPressedOptionId(quizId)
    const currentIndex = selectedAnswers.length

    if (correctOrder[currentIndex] === quizId) {
      setIncorrectAnswer(null)
      const applyCorrect = () => {
        setSelectedAnswers((prev) => [...prev, quizId])
        setAvailableOptions((prev) => prev.filter((id) => id !== quizId))
        setPressedOptionId(null)
        setIsCheckingAnswer(false)
      }
      if (quizFeedback) {
        quizFeedback.presentResult(true, applyCorrect)
      } else {
        applyCorrect()
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

  const hasAnySound = soundUrlsOrdered.some((u) => u.length > 0)

  const handleProceedClick = () => {
    stopSequentialAudio()
    onComplete()
  }

  return (
    <Summary1Root>
      {isCompleted && hasAnySound && (
        <SoundPlayButtonWrap>
          <Summary1SoundToggle
            type='button'
            onClick={toggleSequentialAudio}
            aria-label={isPlaying ? '전체 듣기 정지' : '전체 듣기 재생'}
          >
            {isPlaying ? (
              <IconSoundStop width={40} height={40} />
            ) : (
              <IconSoundPlay width={40} height={40} />
            )}
          </Summary1SoundToggle>
        </SoundPlayButtonWrap>
      )}
      <QuizBody ref={summaryContainerRef}>
        {!isCompleted && (
          <QuizComment>{t(ACTIVITY_INSTRUCTIONS.SUMMARY1)}</QuizComment>
        )}

        <MainContentBox>
          <AnswerAreaContainer ref={answerAreaRef} $isCompleted={isCompleted}>
            <AnswerAreaScroll ref={answerScrollRef} $isCompleted={isCompleted}>
              {selectedAnswers.map((quizId, index) => {
                const isReadingLine =
                  isCompleted && playingIndex !== null && playingIndex === index
                return (
                  <Summary1SlotContentBox
                    key={`filled-${index}`}
                    ref={(node: HTMLDivElement | null) => {
                      sentenceRowRefs.current[index] = node
                    }}
                    $filled
                    $isReading={isReadingLine}
                  >
                    <TextBox
                      fontSize={1.1}
                      fontWeight={600}
                      color={isReadingLine ? '#111827' : 'secondary'}
                      style={{
                        textAlign: 'left',
                        width: '100%',
                        lineHeight: '1.2',
                      }}
                    >
                      {index + 1}. {getQuizText(quizId)}
                    </TextBox>
                  </Summary1SlotContentBox>
                )
              })}
              {!isCompleted && (
                <Summary1SlotContentBox
                  key='next'
                  ref={nextSlotRef}
                  $filled={false}
                >
                  <TextBox
                    fontSize={1.1}
                    fontWeight={600}
                    color='secondary'
                    style={{
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    {selectedAnswers.length + 1}.
                  </TextBox>
                </Summary1SlotContentBox>
              )}
            </AnswerAreaScroll>
          </AnswerAreaContainer>

          {isCompleted && (
            <NextQuestionButtonWrap>
              <NextQuestionButton type='button' onClick={handleProceedClick}>
                {t('study.nextQuestion')}
              </NextQuestionButton>
            </NextQuestionButtonWrap>
          )}

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
                      correctOrder[selectedAnswers.length] === quizId
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
    </Summary1Root>
  )
}

const Summary1Root = styled.div`
  position: relative;
  width: 100%;
`

/** `@components/molecules/study/audio/ButtonSoundPlay` ButtonSoundPlay 좌상단 위치와 동일 */
const SoundPlayButtonWrap = styled.div`
  position: absolute;
  top: -20px;
  left: -20px;
  z-index: 2;
`

const Summary1SoundToggle = styled.button`
  cursor: pointer;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.05s ease;

  &:active {
    transform: scale(0.98) translateY(1px);
  }

  ${media.mobile} {
    width: 32px;
    height: 32px;

    img,
    svg {
      width: 32px;
      height: 32px;
    }
  }
`

const MainContentBox = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: 0;
`

const AnswerAreaContainer = styled.div<{ $isCompleted?: boolean }>`
  flex: 0 1 auto;
  /* min-height: 0; */
  max-height: ${(props) =>
    props.$isCompleted ? 'none' : 'clamp(120px, 32vh, 250px)'};
  display: flex;
  flex-direction: column;

  @supports (height: 1dvh) {
    max-height: ${(props) =>
      props.$isCompleted ? 'none' : 'clamp(120px, 32dvh, 250px)'};
  }
`

const AnswerAreaScroll = styled.div<{ $isCompleted?: boolean }>`
  flex: 1;
  /* min-height: 0; */
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
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  padding-bottom: 4px;
`
