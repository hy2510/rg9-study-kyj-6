/** Practice A6 — 섞인 글자 타일을 배열해 단어 완성(스크램블) */
import { useCallback, useEffect, useRef, useState } from 'react'

import { media } from '@styles/tokens/breakpoints'
import { useTranslation } from 'react-i18next'
import styled, { css, keyframes } from 'styled-components'

import TextBox from '@components/atoms/common/TextBox'
import { CardImageSkeleton } from '@components/atoms/study/cards/CardImageSkeleton'
import QuizComment from '@components/atoms/study/comments/QuizComment'
import QuizCorrectConfettiLayer from '@components/atoms/study/feedback/QuizCorrectConfettiLayer'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import QuestionImageFrameVocabularyWide from '@components/molecules/study/question/images/QuestionImageFrameVocabularyWide'
import { GridQuizOptionCardBox } from '@components/molecules/study/quizOptions/cards/GridQuizOptionCardBox'
import { ACTIVITY_INSTRUCTIONS } from '@constants/study/activityInstructions'
import { useWordPracticeScoreOptional } from '@contexts/WordPracticeScoreContext'
import { useIncorrectSoundPlayer } from '@hooks/study/useIncorrectSoundPlayer'
import { useQuizContainerShake } from '@hooks/study/useQuizContainerShake'
import { useQuizCorrectCelebration } from '@hooks/study/useQuizCorrectCelebration'
import type { WordPracticeContentItem } from '@interfaces/study/word-practice/wordPractice'
import { generateWordPracticeScrambleRounds } from '@utils/generateWordPracticeQuiz'

const AUTO_ADVANCE_MS = 1500

type FilledSlot = {
  letter: string
  tileIndex: number
}

type PracticeA6Props = {
  items: WordPracticeContentItem[]
  initialIndex?: number
  onComplete?: () => void
  onProgressChange?: (current: number, total: number) => void
}

function createEmptySlots(length: number): (FilledSlot | null)[] {
  return Array.from({ length }, () => null)
}

export default function PracticeA6({
  items,
  initialIndex = 0,
  onComplete,
  onProgressChange,
}: PracticeA6Props) {
  const { t } = useTranslation()
  const wordPracticeScore = useWordPracticeScoreOptional()
  const [quizRounds] = useState(() => generateWordPracticeScrambleRounds(items))
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [filledSlots, setFilledSlots] = useState<(FilledSlot | null)[]>([])
  const [isChecking, setIsChecking] = useState(false)
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false)
  const [showIncorrect, setShowIncorrect] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  const wordAudioRef = useRef<HTMLAudioElement | null>(null)
  const hasSubmittedRef = useRef(false)
  const filledForRoundRef = useRef<number>(-1)
  const { confettiBurstKey, trigger, clearConfetti } =
    useQuizCorrectCelebration()
  const { triggerShake } = useQuizContainerShake()
  const { play: playIncorrectSound } = useIncorrectSoundPlayer()

  const currentItem = quizRounds[currentIndex]
  const wordLength = currentItem?.word.length ?? 0
  const usedTileIndices = new Set(
    filledSlots.flatMap((slot) => (slot ? [slot.tileIndex] : [])),
  )
  const isComplete =
    wordLength > 0 &&
    filledSlots.length === wordLength &&
    filledSlots.every(Boolean)

  const stopWordAudio = useCallback(() => {
    const audio = wordAudioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
      wordAudioRef.current = null
    }
  }, [])

  const advanceToNext = useCallback(() => {
    if (currentIndex >= quizRounds.length - 1) {
      onComplete?.()
      return
    }
    setCurrentIndex((prev) => prev + 1)
  }, [currentIndex, quizRounds.length, onComplete])

  const playWordSoundAndAdvance = useCallback(() => {
    if (!currentItem?.sound) {
      advanceToNext()
      return
    }

    stopWordAudio()
    const audio = new Audio(currentItem.sound)
    wordAudioRef.current = audio

    let hasFinished = false
    const finish = () => {
      if (hasFinished) return
      hasFinished = true
      if (wordAudioRef.current === audio) {
        wordAudioRef.current = null
      }
      advanceToNext()
    }

    audio.addEventListener('ended', finish, { once: true })
    audio.addEventListener('error', finish, { once: true })
    audio.play().catch(finish)
  }, [advanceToNext, currentItem, stopWordAudio])

  const resetRoundState = useCallback(() => {
    if (!currentItem) return
    setFilledSlots(createEmptySlots(currentItem.word.length))
    setIsChecking(false)
    setIsCorrectAnswer(false)
    setShowIncorrect(false)
  }, [currentItem])

  const handleBurstEnd = useCallback(() => {
    clearConfetti()
  }, [clearConfetti])

  useEffect(() => {
    onProgressChange?.(currentIndex + 1, quizRounds.length)
  }, [currentIndex, quizRounds.length, onProgressChange])

  useEffect(() => {
    hasSubmittedRef.current = false
    clearConfetti()
    stopWordAudio()
    setImageLoaded(false)
    resetRoundState()

    const img = imageRef.current
    if (img?.complete && img.naturalWidth > 0) {
      setImageLoaded(true)
    }
  }, [currentIndex, clearConfetti, resetRoundState, stopWordAudio])

  useEffect(() => {
    return () => {
      stopWordAudio()
    }
  }, [stopWordAudio])

  const handleLetterClick = (tileIndex: number) => {
    if (isChecking || !currentItem || usedTileIndices.has(tileIndex)) return

    filledForRoundRef.current = currentIndex
    setFilledSlots((prev) => {
      const nextEmptyIndex = prev.findIndex((slot) => slot === null)
      if (nextEmptyIndex === -1) return prev

      const next = [...prev]
      next[nextEmptyIndex] = {
        letter: currentItem.scrambledLetters[tileIndex],
        tileIndex,
      }
      return next
    })
  }

  const handleSlotClick = (slotIndex: number) => {
    if (isChecking) return

    setFilledSlots((prev) => {
      if (!prev[slotIndex]) return prev

      const next = [...prev]
      next[slotIndex] = null
      return next
    })
  }

  useEffect(() => {
    if (!isComplete || !currentItem || hasSubmittedRef.current) return undefined
    if (filledForRoundRef.current !== currentIndex) return undefined

    hasSubmittedRef.current = true
    setIsChecking(true)

    const assembled = filledSlots.map((slot) => slot!.letter).join('')

    if (assembled === currentItem.word) {
      wordPracticeScore?.recordStepResult(
        currentItem.word,
        'practice6',
        'correct',
      )
      setIsCorrectAnswer(true)
      trigger()

      const correctTimer = window.setTimeout(() => {
        playWordSoundAndAdvance()
      }, AUTO_ADVANCE_MS)

      return () => window.clearTimeout(correctTimer)
    }

    setShowIncorrect(true)
    wordPracticeScore?.recordStepResult(
      currentItem.word,
      'practice6',
      'incorrect',
    )
    playIncorrectSound()
    triggerShake()

    const timer = window.setTimeout(() => {
      advanceToNext()
    }, AUTO_ADVANCE_MS)

    return () => window.clearTimeout(timer)
  }, [
    advanceToNext,
    currentIndex,
    currentItem,
    filledSlots,
    isComplete,
    playWordSoundAndAdvance,
    trigger,
    triggerShake,
    wordPracticeScore,
  ])

  if (!currentItem) return null

  const assembledWord = filledSlots.map((slot) => slot?.letter ?? '').join('')

  return (
    <QuizCorrectConfettiLayer
      burstKey={confettiBurstKey}
      onBurstEnd={handleBurstEnd}
    >
      <QuizBody>
        <QuizComment>{t(ACTIVITY_INSTRUCTIONS.PRACTICE_A6)}</QuizComment>

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

          <BlankArea>
            {isComplete ? (
              <AssembledWord
                $isCorrect={isCorrectAnswer}
                $isIncorrect={showIncorrect}
              >
                {assembledWord}
              </AssembledWord>
            ) : (
              filledSlots.map((slot, index) => (
                <BlankSlot
                  key={`${currentItem.word}-slot-${index}`}
                  type='button'
                  onClick={() => handleSlotClick(index)}
                  disabled={!slot}
                  $filled={Boolean(slot)}
                  aria-label={slot ? slot.letter : 'blank'}
                >
                  {slot ? slot.letter : '_'}
                </BlankSlot>
              ))
            )}
          </BlankArea>
        </PromptPanel>

        <LetterTilesRow>
          {currentItem.scrambledLetters.map((letter, tileIndex) => {
            const isUsed = usedTileIndices.has(tileIndex)

            return (
              <LetterTile
                key={`${currentItem.word}-tile-${tileIndex}`}
                $pressed={isUsed}
                $isUsed={isUsed}
                onClick={() => {
                  if (isChecking || isUsed) return
                  handleLetterClick(tileIndex)
                }}
                aria-label={letter}
                aria-disabled={isChecking || isUsed}
              >
                <TextBox fontSize={1.2} fontWeight={600} color='primary'>
                  {letter}
                </TextBox>
              </LetterTile>
            )
          })}
        </LetterTilesRow>
      </QuizBody>
    </QuizCorrectConfettiLayer>
  )
}

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

const BlankArea = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  flex: 1;
  min-width: 0;
  overflow: hidden;
`

const AssembledWord = styled.span<{
  $isCorrect?: boolean
  $isIncorrect?: boolean
}>`
  display: block;
  font-family: 'Rg-B', sans-serif;
  font-size: 40px;
  font-weight: 600;
  line-height: 1.2;
  text-align: center;
  letter-spacing: 0;
  white-space: nowrap;
  color: ${({ $isIncorrect }) => ($isIncorrect ? '#ef3d2e' : '#3c4b62')};
  will-change: transform, opacity, color;

  ${media.mobile} {
    font-size: 28px;
  }

  ${({ $isCorrect }) =>
    $isCorrect &&
    css`
      animation: ${wordTurnGreen} 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    `}
`

const BlankSlot = styled.button<{ $filled?: boolean }>`
  border: none;
  background: transparent;
  padding: 0 4px;
  font-family: 'Rg-B', sans-serif;
  font-size: 40px;
  font-weight: 600;
  line-height: 1.2;
  color: ${({ $filled }) => ($filled ? '#3c4b62' : '#a2b1c4')};
  cursor: ${({ $filled, disabled }) =>
    $filled && !disabled ? 'pointer' : 'default'};
  min-width: 24px;
  text-align: center;

  ${media.mobile} {
    font-size: 28px;
    min-width: 18px;
  }
`

const LetterTilesRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  width: 100%;

  ${media.mobile} {
    gap: 4px;
    margin-bottom: 12px;
  }
`

const LetterTile = styled(GridQuizOptionCardBox)<{ $isUsed?: boolean }>`
  width: 52px;
  min-height: 52px;
  padding: 0;
  opacity: ${({ $isUsed }) => ($isUsed ? 0.35 : 1)};
  cursor: ${({ $isUsed }) => ($isUsed ? 'default' : 'pointer')};

  ${media.mobile} {
    width: 44px;
    min-height: 44px;
  }

  ${({ $isUsed }) =>
    $isUsed &&
    css`
      box-shadow: none;
    `}
`
