import { useContext, useEffect, useRef } from 'react'

import { useTranslation } from 'react-i18next'
import { styled } from 'styled-components'

import CenteredLoading from '@components/atoms/common/CenteredLoading'
import { IconSoundPlay } from '@components/atoms/common/icons/IconSoundPlay'
import { IconSoundStop } from '@components/atoms/common/icons/IconSoundStop'
import TextBox from '@components/atoms/common/TextBox'
import { OptionCardsArea } from '@components/atoms/study/activities/summary-02/OptionCardsArea'
import { SentenceLine } from '@components/atoms/study/activities/summary-02/SentenceLine'
import { SentencePanel } from '@components/atoms/study/activities/summary-02/SentencePanel'
import { Summary2Root } from '@components/atoms/study/activities/summary-02/Summary2Root'
import QuizComment from '@components/atoms/study/comments/QuizComment'
import {
  ActivityRoundButton,
  MainContentBox,
} from '@components/atoms/study/layout/ActivityLayout'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import { UpArrowDivider } from '@components/atoms/study/layout/UpArrowDivider'
import {
  Summary2BlankSlot,
  Summary2SentenceText,
} from '@components/molecules/study/activities/summary-02/Summary2Slots'
import { NextQuestionButton } from '@components/molecules/study/question/NextQuestionButton'
import { StudySummaryOptionCardButton } from '@components/molecules/study/quizOptions/cards/StudySummaryOptionCardButton'
import { AppContext, AppContextProps } from '@contexts/AppContext'
import { useHeartContext } from '@contexts/HeartContext'
import { useQuizFeedbackOptional } from '@contexts/QuizFeedbackContext'
import useStudyAudio from '@hooks/study/legacy/useStudyAudio'
import { useSummary2Quiz } from '@hooks/study/legacy/useSummary2Quiz'
import { useSummary2View } from '@hooks/study/legacy/useSummary2View'
import { ILegacyStudyData } from '@interfaces/study/legacy/LegacyStudy'
import { ACTIVITY_INSTRUCTIONS } from '@src/constants/study/activityInstructions'
import { ISummary2 } from '@src/interfaces/study/ISummary'
import { isObserverMode, isReviewPassMode } from '@src/utils/study/reviewMode'

export default function Summary2(props: ILegacyStudyData) {
  const { t } = useTranslation()
  const { studyInfo, bookInfo } = useContext(AppContext) as AppContextProps
  const isReviewPass = isObserverMode(studyInfo) || isReviewPassMode(studyInfo, bookInfo)
  const quizFeedback = useQuizFeedbackOptional()
  const heart = useHeartContext()

  const quizData = props.quizData as ISummary2 | undefined
  const recordedData = props.recordedData ?? []

  const {
    isReady,
    totalBlanks,
    quizAnswerCount,
    sentenceShape,
    exampleData,
    sentenceSound,
    initial,
    getQuizMeta,
    questionNoToQuizNo,
  } = useSummary2View({
    quizData,
    recordedData,
    studyMode: studyInfo.mode,
  })

  const { playState, playAudio, stopAudio } = useStudyAudio()

  const {
    questionNo,
    currentExample,
    filledTexts,
    bottomExamples,
    pressedOptionText,
    incorrectAnswer,
    isCheckingAnswer,
    isComplete,
    handleOptionClick,
  } = useSummary2Quiz({
    props,
    isReady,
    totalBlanks,
    quizAnswerCount,
    exampleData,
    initial,
    getQuizMeta,
    questionNoToQuizNo,
    studyMode: studyInfo.mode,
    isReviewPass,
    heart,
    quizFeedback,
  })

  const nextSlotRef = useRef<HTMLSpanElement>(null)
  const sentencePanelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isReady) return
    nextSlotRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [questionNo])

  // 헤더 Q 번호 화면 동기화 — 현재 채우는 blank 번호(1-based) 를 컨테이너로 전달
  useEffect(() => {
    if (!isReady) return
    props.onActiveQuizChange?.(Math.min(questionNo, totalBlanks))
  }, [isReady, questionNo, totalBlanks, props])

  useEffect(() => {
    if (isComplete) {
      sentencePanelRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      if (sentenceSound) {
        playAudio(sentenceSound)
      }
    }
  }, [isComplete])

  if (!isReady) return <CenteredLoading />

  const handleProceedClick = () => {
    stopAudio()
    props.onFinishActivity()
  }

  const handlePlaySoundToggle = () => {
    if (!sentenceSound) return
    if (playState === 'playing') {
      stopAudio()
    } else {
      playAudio(sentenceSound)
    }
  }

  return (
    <Summary2Root>
      <QuizBody $fillToMaxHeight>
        {!isComplete && (
          <QuizComment>{t(ACTIVITY_INSTRUCTIONS.SUMMARY2)}</QuizComment>
        )}

        <MainContentBox>
          {isComplete && sentenceSound && (
            <ResultListSoundWrap>
              <ActivityRoundButton
                type='button'
                $size={40}
                onClick={handlePlaySoundToggle}
                aria-label={
                  playState === 'playing' ? '문장 듣기 정지' : '문장 듣기 재생'
                }
              >
                {playState === 'playing' ? (
                  <IconSoundStop width={40} height={40} />
                ) : (
                  <IconSoundPlay width={40} height={40} />
                )}
              </ActivityRoundButton>
            </ResultListSoundWrap>
          )}
          <SentencePanel ref={sentencePanelRef} $isCompleted={isComplete}>
            <Summary2SentenceText>
              {sentenceShape.lines.map((line, lineIdx) => (
                <SentenceLine key={`line-${lineIdx}`}>
                  {line.tokens.map((tok, tokIdx) => {
                    if (tok.kind === 'word') {
                      return (
                        <span
                          key={`w-${lineIdx}-${tokIdx}`}
                          dangerouslySetInnerHTML={{ __html: tok.text + ' ' }}
                        />
                      )
                    }
                    const filledEntry = filledTexts[tok.questionIndex]
                    const isFilled = !!filledEntry
                    const isNext =
                      !isComplete && tok.questionIndex === questionNo
                    return (
                      <span key={`b-${lineIdx}-${tokIdx}`}>
                        {tok.leadingText}
                        <Summary2BlankSlot
                          ref={isNext ? nextSlotRef : undefined}
                          $filled={isFilled}
                          $isNext={isNext}
                          $isCorrect={filledEntry?.isCorrect}
                        >
                          {isFilled
                            ? filledEntry.text
                            : isNext
                              ? '?'
                              : '\u00A0\u00A0\u00A0\u00A0'}
                        </Summary2BlankSlot>
                        {tok.trailingText}{' '}
                      </span>
                    )
                  })}
                </SentenceLine>
              ))}
            </Summary2SentenceText>
          </SentencePanel>
          {isComplete && (
            <ResultListNextWrap>
              <NextQuestionButton type='button' onClick={handleProceedClick}>
                {t('study.confirm')}
              </NextQuestionButton>
            </ResultListNextWrap>
          )}

          {!isComplete && (
            <>
              <UpArrowDivider />

              <OptionCardsArea>
                {bottomExamples.map((ex) => (
                  <StudySummaryOptionCardButton
                    key={ex.Text}
                    $pressed={pressedOptionText === ex.Text}
                    $isCorrect={
                      pressedOptionText === ex.Text &&
                      currentExample?.Text === ex.Text
                    }
                    $isIncorrect={incorrectAnswer === ex.Text}
                    onClick={() => handleOptionClick(ex.Text)}
                    disabled={isCheckingAnswer}
                  >
                    <TextBox
                      fontSize={1.1}
                      fontWeight={600}
                      color='primary'
                      style={{ textAlign: 'left', width: '100%' }}
                    >
                      <span dangerouslySetInnerHTML={{ __html: ex.Text }} />
                    </TextBox>
                  </StudySummaryOptionCardButton>
                ))}
              </OptionCardsArea>
            </>
          )}
        </MainContentBox>
      </QuizBody>
    </Summary2Root>
  )
}

const ResultListSoundWrap = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-shrink: 0;
  padding: 4px 0 8px;
`

const ResultListNextWrap = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
  width: 100%;
  padding-top: 0;
`
