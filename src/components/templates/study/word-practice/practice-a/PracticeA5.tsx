/** Practice A5 — 이미지·단어를 보고 마이크로 발음 녹음·채점 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { media } from '@styles/tokens/breakpoints'
import { useTranslation } from 'react-i18next'
import styled, { css, keyframes } from 'styled-components'

import arrowRightIcon from '@assets/icons/arrow-right.svg'
import microphoneIcon from '@assets/icons/microphone.svg'
import TextBox from '@components/atoms/common/TextBox'
import { CardImageSkeleton } from '@components/atoms/study/cards/CardImageSkeleton'
import QuizComment from '@components/atoms/study/comments/QuizComment'
import QuizCorrectConfettiLayer from '@components/atoms/study/feedback/QuizCorrectConfettiLayer'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import MicrophoneUnavailableConfirm from '@components/molecules/common/MicrophoneUnavailableConfirm'
import QuestionImageFrameVocabularyWide from '@components/molecules/study/question/images/QuestionImageFrameVocabularyWide'
import { ACTIVITY_INSTRUCTIONS } from '@constants/study/activityInstructions'
import { useWordPracticeScoreOptional } from '@contexts/WordPracticeScoreContext'
import { useIncorrectSoundPlayer } from '@hooks/study/useIncorrectSoundPlayer'
import { useQuizContainerShake } from '@hooks/study/useQuizContainerShake'
import { useQuizCorrectCelebration } from '@hooks/study/useQuizCorrectCelebration'
import type { WordPracticeRecordingResult } from '@hooks/study/useWordPracticeRecording'
import { useWordPracticeRecording } from '@hooks/study/useWordPracticeRecording'
import type { WordPracticeContentItem } from '@interfaces/study/word-practice/wordPractice'

const AUTO_ADVANCE_MS = 1500
const RECORD_BUTTON_SIZE_PX = 60
const SKIP_ARROW_SIZE_PX = 16

type PracticeA5Props = {
  items: WordPracticeContentItem[]
  initialIndex?: number
  onComplete?: () => void
  onProgressChange?: (current: number, total: number) => void
}

export default function PracticeA5({
  items,
  initialIndex = 0,
  onComplete,
  onProgressChange,
}: PracticeA5Props) {
  const { t } = useTranslation()
  const wordPracticeScore = useWordPracticeScoreOptional()
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const scoreRecordedRef = useRef(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [showMicUnavailableDialog, setShowMicUnavailableDialog] =
    useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  const advanceTimerRef = useRef<number | null>(null)
  const retryTimerRef = useRef<number | null>(null)
  const { confettiBurstKey, trigger, clearConfetti } =
    useQuizCorrectCelebration()
  const { triggerShake } = useQuizContainerShake()
  const { play: playIncorrectSound } = useIncorrectSoundPlayer()

  const currentItem = items[currentIndex]

  const recordA5Score = useCallback(
    (result: 'correct' | 'neutral') => {
      if (scoreRecordedRef.current || !currentItem) return
      scoreRecordedRef.current = true
      wordPracticeScore?.recordStepResult(currentItem.word, 'practice5', result)
    },
    [currentItem, wordPracticeScore],
  )

  const clearTimers = useCallback(() => {
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current)
      advanceTimerRef.current = null
    }
    if (retryTimerRef.current !== null) {
      window.clearTimeout(retryTimerRef.current)
      retryTimerRef.current = null
    }
  }, [])

  const advanceToNext = useCallback(() => {
    if (currentIndex >= items.length - 1) {
      onComplete?.()
      return
    }
    setCurrentIndex((prev) => prev + 1)
  }, [currentIndex, items.length, onComplete])

  const advanceToNextRef = useRef(advanceToNext)
  useLayoutEffect(() => {
    advanceToNextRef.current = advanceToNext
  })

  const resetRecordingAnalysisRef = useRef<() => void>(() => {})

  const handleRecordingResult = useCallback(
    (result: WordPracticeRecordingResult) => {
      clearTimers()

      if (result === 'correct') {
        recordA5Score('correct')
        trigger()
        advanceTimerRef.current = window.setTimeout(() => {
          advanceToNextRef.current()
        }, AUTO_ADVANCE_MS)
        return
      }

      if (result === 'incorrect') {
        playIncorrectSound()
        triggerShake()
        retryTimerRef.current = window.setTimeout(() => {
          resetRecordingAnalysisRef.current()
        }, AUTO_ADVANCE_MS)
        return
      }

      if (result === 'no_microphone') {
        resetRecordingAnalysisRef.current()
        setShowMicUnavailableDialog(true)
        return
      }

      triggerShake()
      retryTimerRef.current = window.setTimeout(() => {
        resetRecordingAnalysisRef.current()
      }, AUTO_ADVANCE_MS)
    },
    [clearTimers, playIncorrectSound, recordA5Score, trigger, triggerShake],
  )

  const {
    isRecordingMode,
    isAnalyzing,
    recordingResult,
    resetRecordingAnalysis,
    startRecordingAnalysis,
  } = useWordPracticeRecording({
    targetWord: currentItem?.word ?? '',
    targetSoundUrl: currentItem?.sound,
    onResult: handleRecordingResult,
  })

  useLayoutEffect(() => {
    resetRecordingAnalysisRef.current = resetRecordingAnalysis
  })

  const isCorrect = recordingResult === 'correct'
  const isIncorrect = recordingResult === 'incorrect'
  const isInteractionLocked =
    isRecordingMode || isAnalyzing || isCorrect || showMicUnavailableDialog

  const handleBurstEnd = useCallback(() => {
    clearConfetti()
  }, [clearConfetti])

  useEffect(() => {
    onProgressChange?.(currentIndex + 1, items.length)
  }, [currentIndex, items.length, onProgressChange])

  useEffect(() => {
    scoreRecordedRef.current = false
    clearTimers()
    resetRecordingAnalysis()
    clearConfetti()
    setShowMicUnavailableDialog(false)
    setImageLoaded(false)

    const img = imageRef.current
    if (img?.complete && img.naturalWidth > 0) {
      setImageLoaded(true)
    }
  }, [currentIndex, clearConfetti, clearTimers, resetRecordingAnalysis])

  useEffect(() => {
    return () => {
      clearTimers()
    }
  }, [clearTimers])

  const handleSkip = () => {
    if (isRecordingMode || isAnalyzing) return
    recordA5Score('neutral')
    clearTimers()
    advanceToNext()
  }

  const handleRecord = () => {
    if (isInteractionLocked || showMicUnavailableDialog) return
    // 오답 후 예약된 retryTimer(resetRecordingAnalysis) 가 새 녹음 세션 중에
    // 발화해 즉시 리셋되는 레이스 방지. advanceTimer 도 동시에 정리.
    clearTimers()
    startRecordingAnalysis()
  }

  const handleMicUnavailableConfirmSkip = () => {
    setShowMicUnavailableDialog(false)
    clearTimers()
    resetRecordingAnalysisRef.current()
    onComplete?.()
  }

  if (!currentItem) return null

  const skipControl = (
    <SkipButton
      type='button'
      onClick={handleSkip}
      disabled={isRecordingMode || isAnalyzing}
      aria-label='Skip'
    >
      <TextBox fontSize={1} fontWeight={600} color='secondary'>
        Skip
      </TextBox>
      <img
        src={arrowRightIcon}
        width={SKIP_ARROW_SIZE_PX}
        height={SKIP_ARROW_SIZE_PX}
        alt=''
      />
    </SkipButton>
  )

  return (
    <>
      <MicrophoneUnavailableConfirm
        open={showMicUnavailableDialog}
        onConfirmSkip={handleMicUnavailableConfirmSkip}
        onCancel={() => setShowMicUnavailableDialog(false)}
      />
      <QuizCorrectConfettiLayer
        burstKey={confettiBurstKey}
        onBurstEnd={handleBurstEnd}
      >
        <QuizBody>
          <QuizHeader>
            <QuizComment>{t(ACTIVITY_INSTRUCTIONS.PRACTICE_A5)}</QuizComment>
            <HeaderSkipSlot>{skipControl}</HeaderSkipSlot>
          </QuizHeader>

          <PromptPanel>
            <PromptImageFrame>
              {!imageLoaded && <CardImageSkeleton />}
              <img
                key={currentItem.image}
                ref={imageRef}
                src={currentItem.image}
                alt=''
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
                style={{ opacity: imageLoaded ? 1 : 0 }}
              />
            </PromptImageFrame>

            <WordArea>
              <PromptWord
                $matchedCorrect={isCorrect}
                $isIncorrect={isIncorrect}
              >
                {currentItem.word}
              </PromptWord>
            </WordArea>
          </PromptPanel>

          <RecordButtonRow>
            <RecordButton
              type='button'
              $recording={isRecordingMode}
              disabled={isInteractionLocked}
              onClick={handleRecord}
              aria-label={t('study.record')}
              aria-pressed={isRecordingMode}
            >
              <img
                src={microphoneIcon}
                width={RECORD_BUTTON_SIZE_PX}
                height={RECORD_BUTTON_SIZE_PX}
                alt=''
              />
            </RecordButton>
          </RecordButtonRow>

          <FooterSkipSlot>{skipControl}</FooterSkipSlot>
        </QuizBody>
      </QuizCorrectConfettiLayer>
    </>
  )
}

const QuizHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`

const HeaderSkipSlot = styled.div`
  display: flex;
  align-items: center;

  ${media.mobile} {
    display: none;
  }
`

const FooterSkipSlot = styled.div`
  display: none;
  justify-content: center;
  width: 100%;

  ${media.mobile} {
    display: flex;
    padding: 4px 0 8px 0;
  }
`

const SkipButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: transform 0.05s ease;

  &:active:not(:disabled) {
    transform: scale(0.96) translateY(1px);
  }

  &:disabled {
    cursor: default;
    opacity: 0.45;
  }
`

const PromptPanel = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 20px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding: 20px 28px;
  background-color: #fff;
  border: 1.5px solid #e9edf3;
  border-radius: 25px;
  margin-bottom: 16px;

  ${media.mobile} {
    grid-template-columns: minmax(0, 1fr);
    padding: 16px;
    gap: 12px;
    margin-bottom: 12px;
  }
`

const PromptImageFrame = styled(QuestionImageFrameVocabularyWide)`
  width: 100%;
  min-width: 0;
  min-height: 0;
  max-width: 100%;
  height: auto;
  margin: 0;
  flex-shrink: 1;
  border: none;
  box-shadow: none;
  padding: 0;
  overflow: hidden;
  box-sizing: border-box;
  height: clamp(140px, 28vh, 250px);
  height: clamp(140px, 28dvh, 250px);

  img {
    display: block;
    max-width: 100%;
    max-height: 100%;
    min-width: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`

const wordTurnGreen = keyframes`
  0% {
    color: #3c4b62;
    transform: scale(1);
  }
  65% {
    color: #2ec88a;
    transform: scale(1.05);
  }
  100% {
    color: #1baa70;
    transform: scale(1);
  }
`

const WordArea = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1;
  min-width: 0;
  min-height: 48px;
  overflow: hidden;
`

const PromptWord = styled.span<{
  $matchedCorrect?: boolean
  $isIncorrect?: boolean
}>`
  display: block;
  position: relative;
  font-family: 'Rg-B', sans-serif;
  font-size: 40px;
  font-weight: 600;
  color: ${({ $isIncorrect }) => ($isIncorrect ? '#ef3d2e' : '#3c4b62')};
  line-height: 1;
  text-align: center;
  will-change: transform, opacity, color;

  ${media.mobile} {
    font-size: 28px;
  }

  ${({ $matchedCorrect }) =>
    $matchedCorrect &&
    css`
      animation: ${wordTurnGreen} 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    `}
`

const RecordButtonRow = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`

const recordingBorderWave = keyframes`
  0% {
    box-shadow:
      0 0 0 0 rgba(239, 61, 100, 0.38),
      0 0 0 0 rgba(239, 61, 100, 0.22);
  }
  70% {
    box-shadow:
      0 0 0 8px rgba(239, 61, 100, 0),
      0 0 0 18px rgba(239, 61, 100, 0);
  }
  100% {
    box-shadow:
      0 0 0 0 rgba(239, 61, 100, 0),
      0 0 0 0 rgba(239, 61, 100, 0);
  }
`

const RecordButton = styled.button<{ $recording?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  transition: transform 0.05s ease;

  ${({ $recording }) =>
    $recording &&
    css`
      animation: ${recordingBorderWave} 1.35s ease-out infinite;
    `}

  &:active:not(:disabled) {
    transform: scale(0.96) translateY(1px);
  }

  &:disabled {
    cursor: default;
    opacity: 0.45;
  }
`
