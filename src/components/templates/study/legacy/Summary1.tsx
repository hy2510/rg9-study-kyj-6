import { useContext, useEffect, useMemo, useRef } from 'react'

import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import CenteredLoading from '@components/atoms/common/CenteredLoading'
import { IconSoundPlay } from '@components/atoms/common/icons/IconSoundPlay'
import { IconSoundStop } from '@components/atoms/common/icons/IconSoundStop'
import TextBox from '@components/atoms/common/TextBox'
import { AnswerAreaContainer } from '@components/atoms/study/activities/summary-01/AnswerAreaContainer'
import { AnswerAreaScroll } from '@components/atoms/study/activities/summary-01/AnswerAreaScroll'
import { OptionCardsArea } from '@components/atoms/study/activities/summary-01/OptionCardsArea'
import { PenaltySentenceInline } from '@components/atoms/study/activities/summary-01/PenaltySentenceInline'
import { PenaltySentencePanel } from '@components/atoms/study/activities/summary-01/PenaltySentencePanel'
import { Summary1Root } from '@components/atoms/study/activities/summary-01/Summary1Root'
import { ReviewBadge } from '@components/atoms/study/badges/ReviewBadge'
import {
  HintButton,
  HintButtonWrap,
} from '@components/atoms/study/buttons/HintButton'
import QuizComment from '@components/atoms/study/comments/QuizComment'
import {
  ActivityRoundButton,
  MainContentBox,
} from '@components/atoms/study/layout/ActivityLayout'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import { UpArrowDivider } from '@components/atoms/study/layout/UpArrowDivider'
import {
  PenaltyCharSlot,
  PenaltyHiddenInput,
  PenaltySolvedWord,
  PenaltySpellingSlots,
  PenaltyWordBox,
} from '@components/molecules/study/activities/summary-01/Summary1PenaltyInput'
import { Summary1SlotContentBox } from '@components/molecules/study/activities/summary-01/Summary1Slot'
import { NextQuestionButton } from '@components/molecules/study/question/NextQuestionButton'
import { StudySummaryOptionCardButton } from '@components/molecules/study/quizOptions/cards/StudySummaryOptionCardButton'
import { AppContext, AppContextProps } from '@contexts/AppContext'
import { useHeartContext } from '@contexts/HeartContext'
import { useQuizFeedbackOptional } from '@contexts/QuizFeedbackContext'
import useStudyAudio from '@hooks/study/legacy/useStudyAudio'
import { useSummary1Quiz } from '@hooks/study/legacy/useSummary1Quiz'
import { useSummary1View } from '@hooks/study/legacy/useSummary1View'
import { useSummary1SequentialAudio } from '@hooks/study/remix/useSummary1SequentialAudio'
import { ILegacyStudyData } from '@interfaces/study/legacy/LegacyStudy'
import { ACTIVITY_INSTRUCTIONS } from '@src/constants/study/activityInstructions'
import { ISummary1 } from '@src/interfaces/study/ISummary'
import {
  getLettersOnly,
  isSpecialOrSpace,
  isSpellingCorrect,
} from '@src/utils/spellingUtils'
import { isObserverMode, isReviewPassMode } from '@src/utils/study/reviewMode'

export default function Summary1(props: ILegacyStudyData) {
  const { t } = useTranslation()
  const { studyInfo, bookInfo } = useContext(AppContext) as AppContextProps
  const isReviewPass = isObserverMode(studyInfo) || isReviewPassMode(studyInfo, bookInfo)
  const quizFeedback = useQuizFeedbackOptional()
  const heart = useHeartContext()

  const quizData = props.quizData as ISummary1 | undefined
  const recordedData = props.recordedData ?? []

  const {
    isReady,
    totalQuiz,
    quizAnswerCount,
    orderedQuizzes,
    soundUrlsOrdered,
    startQuizNo,
    startTryCount,
    hint: hintMeta,
  } = useSummary1View({
    quizData,
    recordedData,
    studyMode: studyInfo.mode,
  })

  // 정책: Summary1 은 서버 IsEnablePenaltyReview 값과 무관하게 페널티 리뷰를 노출하지 않는다.
  const isEnablePenaltyReview = false
  const startPenaltyState = 'none' as const

  const correctOrder = useMemo(
    () => orderedQuizzes.map((q) => q.quizId),
    [orderedQuizzes],
  )

  const { playAudio: playAnswerAudio, stopAudio: stopAnswerAudio } =
    useStudyAudio()

  const {
    selectedAnswers,
    availableOptions,
    pressedOptionId,
    incorrectAnswer,
    isCheckingAnswer,
    penaltyState,
    hintTry,
    isCompleted,
    getQuizText,
    handleOptionClick,
    handleHintClick,
    onPenaltyInputChange,
    focusPenaltyWord,
  } = useSummary1Quiz({
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
    studyMode: studyInfo.mode,
    isReviewPass,
    heart,
    quizFeedback,
    soundUrlsOrdered,
    playAudio: playAnswerAudio,
  })

  const hasAnySound = soundUrlsOrdered.some((u) => u.length > 0)

  const {
    playingIndex,
    isPlaying,
    toggle: toggleSequentialAudio,
    playOne: playOneSequentialAudio,
    stop: stopSequentialAudio,
  } = useSummary1SequentialAudio(soundUrlsOrdered)

  const answerAreaRef = useRef<HTMLDivElement>(null)
  const answerScrollRef = useRef<HTMLDivElement>(null)
  const summaryContainerRef = useRef<HTMLDivElement>(null)
  const sentenceRowRefs = useRef<(HTMLDivElement | null)[]>([])
  const nextSlotRef = useRef<HTMLDivElement>(null)
  const penaltyInputRefs = useRef<HTMLInputElement[]>([])

  useEffect(() => {
    if (!isCompleted && nextSlotRef.current && answerAreaRef.current) {
      nextSlotRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [selectedAnswers.length, isCompleted])

  // 헤더 Q 번호 화면 동기화 — 현재 채워야 할 슬롯 인덱스(1-based) 를 컨테이너로 전달
  useEffect(() => {
    if (!isReady) return
    const nextIndex = Math.min(selectedAnswers.length + 1, totalQuiz)
    props.onActiveQuizChange?.(nextIndex)
  }, [isReady, selectedAnswers.length, totalQuiz, props])

  useEffect(() => {
    if (!isCompleted) return
    // 완료 화면 진입 시, 정오답용 오디오는 즉시 정지해 시퀀셜 재생과 충돌하지 않게 한다.
    stopAnswerAudio()
    const scrollToTop = (el: HTMLDivElement | null) => {
      if (!el) return
      el.scrollTo({ top: 0, behavior: 'smooth' })
    }
    scrollToTop(answerScrollRef.current)
    scrollToTop(summaryContainerRef.current)
  }, [isCompleted])

  useEffect(() => {
    if (!isCompleted || playingIndex === null) return
    const row = sentenceRowRefs.current[playingIndex]
    row?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [isCompleted, playingIndex])

  useEffect(() => {
    if (!penaltyState.isActive) return
    penaltyInputRefs.current[penaltyState.currentInputIndex]?.focus()
  }, [penaltyState.currentInputIndex, penaltyState.isActive])

  if (!isReady) return <CenteredLoading />

  const handleProceedClick = () => {
    stopSequentialAudio()
    props.onFinishActivity()
  }

  return (
    <Summary1Root>
      <QuizBody ref={summaryContainerRef}>
        {!isCompleted && (
          <QuizComment>{t(ACTIVITY_INSTRUCTIONS.SUMMARY1)}</QuizComment>
        )}

        <MainContentBox>
          <AnswerAreaContainer ref={answerAreaRef} $isCompleted={isCompleted}>
            <AnswerAreaScroll ref={answerScrollRef} $isCompleted={isCompleted}>
              {isCompleted && hasAnySound && (
                <ResultListSoundWrap>
                  <ActivityRoundButton
                    type='button'
                    $size={40}
                    onClick={toggleSequentialAudio}
                    aria-label={isPlaying ? '전체 듣기 정지' : '전체 듣기 재생'}
                  >
                    {isPlaying ? (
                      <IconSoundStop width={40} height={40} />
                    ) : (
                      <IconSoundPlay width={40} height={40} />
                    )}
                  </ActivityRoundButton>
                </ResultListSoundWrap>
              )}
              {selectedAnswers.map((entry, index) => {
                const isReadingLine =
                  isCompleted && playingIndex !== null && playingIndex === index
                const canClickPlay =
                  isCompleted && !!soundUrlsOrdered[index]?.trim()
                return (
                  <Summary1SlotContentBox
                    key={`filled-${index}`}
                    ref={(node: HTMLDivElement | null) => {
                      sentenceRowRefs.current[index] = node
                    }}
                    $filled
                    $isReading={isReadingLine}
                    onClick={
                      canClickPlay
                        ? () => playOneSequentialAudio(index)
                        : undefined
                    }
                    style={
                      canClickPlay ? { cursor: 'pointer' } : undefined
                    }
                  >
                    <TextBox
                      fontSize={1.1}
                      fontFamily='Rg-B'
                      color={
                        isReadingLine
                          ? '#111827'
                          : entry.isCorrect
                            ? '#3c4b62'
                            : '#e07a7a'
                      }
                      style={{
                        textAlign: 'left',
                        width: '100%',
                        lineHeight: '1.2',
                      }}
                    >
                      <span>{index + 1}. </span>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: getQuizText(entry.quizId),
                        }}
                      />
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
                    fontFamily='Rg-B'
                    color='secondary'
                    style={{ textAlign: 'left', width: '100%' }}
                  >
                    {selectedAnswers.length + 1}.
                  </TextBox>
                </Summary1SlotContentBox>
              )}
              {isCompleted && (
                <ResultListNextWrap>
                  <NextQuestionButton type='button' onClick={handleProceedClick}>
                    {t('study.confirm')}
                  </NextQuestionButton>
                </ResultListNextWrap>
              )}
            </AnswerAreaScroll>
          </AnswerAreaContainer>

          {!isCompleted && (
            <>
              <UpArrowDivider />

              {penaltyState.isActive ? (
                <>
                  <ReviewBadge>· Test Review</ReviewBadge>
                  <div style={{ marginBottom: '15px' }} />
                  <PenaltySentencePanel>
                    <PenaltySentenceInline>
                      {penaltyState.words.map((word, i) => {
                        const isCurrent = i === penaltyState.currentInputIndex
                        const inputValue = penaltyState.inputValues[i] ?? ''
                        const isSolved =
                          inputValue.length > 0 &&
                          isSpellingCorrect(inputValue, word)

                        if (isSolved && !isCurrent) {
                          return (
                            <PenaltySolvedWord key={`pen-solved-${i}`}>
                              {word}{' '}
                            </PenaltySolvedWord>
                          )
                        }

                        return (
                          <PenaltyWordBox
                            key={`pen-${i}`}
                            onClick={() => penaltyInputRefs.current[i]?.focus()}
                          >
                            {/* 키보드 입력 캡처용 숨겨진 input */}
                            <PenaltyHiddenInput
                              ref={(el) => {
                                if (el) penaltyInputRefs.current[i] = el
                              }}
                              type='text'
                              value={inputValue}
                              onChange={(e) => onPenaltyInputChange(e, i)}
                              onFocus={() => focusPenaltyWord(i)}
                              onCopy={(e) => e.preventDefault()}
                              onPaste={(e) => e.preventDefault()}
                              onCut={(e) => e.preventDefault()}
                              autoCapitalize='off'
                              autoComplete='off'
                              autoCorrect='off'
                              inputMode='text'
                              tabIndex={-1}
                              disabled={!isCurrent}
                            />
                            {/* 문자 슬롯 시각 표시 — 미입력: ghost(회색), 입력됨: 초록 */}
                            <PenaltySpellingSlots $isCurrent={isCurrent}>
                              {Array.from({ length: word.length }).map(
                                (_, charIdx) => {
                                  const answerChar = word[charIdx]
                                  const isFixed = isSpecialOrSpace(answerChar)
                                  const letterIndex = getLettersOnly(
                                    word.slice(0, charIdx),
                                  ).length
                                  const rawInputChar = isFixed
                                    ? answerChar
                                    : (inputValue[letterIndex] ?? '')
                                  const isPlaceholder =
                                    !isFixed && rawInputChar === ''
                                  const isCharIncorrect =
                                    !isFixed &&
                                    !isPlaceholder &&
                                    rawInputChar.toLowerCase() !==
                                      answerChar.toLowerCase()
                                  // answerChar 가 대문자이면 inputChar 도 대문자로, 소문자이면 소문자로 표시
                                  const inputChar =
                                    !isFixed && rawInputChar !== ''
                                      ? /[A-Z]/.test(answerChar)
                                        ? rawInputChar.toUpperCase()
                                        : rawInputChar.toLowerCase()
                                      : rawInputChar
                                  return (
                                    <PenaltyCharSlot
                                      key={charIdx}
                                      $isFixed={isFixed}
                                      $isPlaceholder={isPlaceholder}
                                      $isIncorrect={isCharIncorrect}
                                    >
                                      {isPlaceholder ? answerChar : inputChar}
                                    </PenaltyCharSlot>
                                  )
                                },
                              )}
                            </PenaltySpellingSlots>
                          </PenaltyWordBox>
                        )
                      })}
                    </PenaltySentenceInline>
                  </PenaltySentencePanel>
                </>
              ) : (
                <>
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
                          <span
                            dangerouslySetInnerHTML={{
                              __html: getQuizText(quizId),
                            }}
                          />
                        </TextBox>
                      </StudySummaryOptionCardButton>
                    ))}
                  </OptionCardsArea>
                  {hintMeta.IsEnabled && (
                    <HintButtonWrap>
                      <HintButton
                        type='button'
                        onClick={handleHintClick}
                        disabled={
                          isCheckingAnswer ||
                          (hintMeta.Max ?? 0) - hintTry <= 0
                        }
                      >
                        Chance ({Math.max((hintMeta.Max ?? 0) - hintTry, 0)})
                      </HintButton>
                    </HintButtonWrap>
                  )}
                </>
              )}
            </>
          )}
        </MainContentBox>
      </QuizBody>
    </Summary1Root>
  )
}

const ResultListSoundWrap = styled.div`
  display: flex;
  justify-content: flex-start;
  padding: 4px 0 8px;
`

const ResultListNextWrap = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  padding-top: 0;
`
