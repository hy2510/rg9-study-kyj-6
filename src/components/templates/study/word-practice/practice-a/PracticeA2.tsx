/** Practice A2 — 이미지와 표시 단어가 일치하는지 O/X 판별 */
import { useCallback, useEffect, useRef, useState } from 'react'

import { media } from '@styles/tokens/breakpoints'
import { useTranslation } from 'react-i18next'
import styled, { css, keyframes } from 'styled-components'

import TextBox from '@components/atoms/common/TextBox'
import { CardImageSkeleton } from '@components/atoms/study/cards/CardImageSkeleton'
import { OptionCardsRow } from '@components/atoms/study/cards/OptionCardsRow'
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
import { generateWordPracticeQuizRounds } from '@utils/generateWordPracticeQuiz'

const AUTO_ADVANCE_MS = 1500

type AnswerChoice = 'O' | 'X'

type PracticeA2Props = {
  items: WordPracticeContentItem[]
  initialIndex?: number
  onComplete?: () => void
  onProgressChange?: (current: number, total: number) => void
}

export default function PracticeA2({
  items,
  initialIndex = 0,
  onComplete,
  onProgressChange,
}: PracticeA2Props) {
  const { t } = useTranslation()
  const wordPracticeScore = useWordPracticeScoreOptional()
  const [quizRounds] = useState(() => generateWordPracticeQuizRounds(items))
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerChoice | null>(
    null,
  )
  const imageRef = useRef<HTMLImageElement>(null)
  const wordAudioRef = useRef<HTMLAudioElement | null>(null)
  const { confettiBurstKey, trigger, clearConfetti } =
    useQuizCorrectCelebration()
  const { triggerShake } = useQuizContainerShake()
  const { play: playIncorrectSound } = useIncorrectSoundPlayer()

  const currentItem = quizRounds[currentIndex]
  const correctAnswer: AnswerChoice = currentItem?.isMatch ? 'O' : 'X'
  const isAnswered = selectedAnswer !== null
  const isCorrect = selectedAnswer === correctAnswer

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

  const handleBurstEnd = useCallback(() => {
    clearConfetti()
  }, [clearConfetti])

  useEffect(() => {
    onProgressChange?.(currentIndex + 1, quizRounds.length)
  }, [currentIndex, quizRounds.length, onProgressChange])

  useEffect(() => {
    setSelectedAnswer(null)
    clearConfetti()
    stopWordAudio()
    setImageLoaded(false)

    const img = imageRef.current
    if (img?.complete && img.naturalWidth > 0) {
      setImageLoaded(true)
    }
  }, [currentIndex, clearConfetti, stopWordAudio])

  useEffect(() => {
    return () => {
      stopWordAudio()
    }
  }, [stopWordAudio])

  useEffect(() => {
    if (!isAnswered) return undefined

    const timer = window.setTimeout(() => {
      if (isCorrect) {
        playWordSoundAndAdvance()
      } else {
        advanceToNext()
      }
    }, AUTO_ADVANCE_MS)

    return () => window.clearTimeout(timer)
  }, [isAnswered, isCorrect, advanceToNext, playWordSoundAndAdvance])

  const handleAnswer = (answer: AnswerChoice) => {
    if (isAnswered || !currentItem) return
    setSelectedAnswer(answer)

    const scoredWord =
      currentItem.correctWord ||
      items.find((item) => item.image === currentItem.image)?.word ||
      currentItem.displayWord
    const isChoiceCorrect = answer === correctAnswer
    wordPracticeScore?.recordStepResult(
      scoredWord,
      'practice2',
      isChoiceCorrect ? 'correct' : 'incorrect',
    )

    if (isChoiceCorrect) {
      trigger()
    } else {
      playIncorrectSound()
      triggerShake()
    }
  }

  if (!currentItem) return null

  const correctWord =
    currentItem.correctWord ||
    items.find((item) => item.image === currentItem.image)?.word ||
    currentItem.displayWord
  const showCorrectedWord =
    isAnswered && currentItem.displayWord !== correctWord
  const showMatchedCorrect = isCorrect && !showCorrectedWord

  return (
    <QuizCorrectConfettiLayer
      burstKey={confettiBurstKey}
      onBurstEnd={handleBurstEnd}
    >
      <QuizBody>
        <QuizComment>{t(ACTIVITY_INSTRUCTIONS.PRACTICE_A2)}</QuizComment>

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

          <WordArea $showResult={showCorrectedWord}>
            <WordResultStack>
              <PromptWord
                $strikethrough={showCorrectedWord}
                $matchedCorrect={showMatchedCorrect}
              >
                {currentItem.displayWord}
              </PromptWord>
              <CorrectAnswerWord $visible={showCorrectedWord}>
                {correctWord}
              </CorrectAnswerWord>
            </WordResultStack>
          </WordArea>
        </PromptPanel>

        <OptionCardsRow>
          <GridQuizOptionCardBox
            $inRow
            $pressed={selectedAnswer === 'O' && !isCorrect}
            $isCorrect={selectedAnswer === 'O' && isCorrect}
            $isIncorrect={selectedAnswer === 'O' && !isCorrect}
            onClick={() => handleAnswer('O')}
            aria-label='O'
          >
            <TextBox
              fontSize={1.5}
              fontWeight={600}
              color={
                selectedAnswer === 'O' && isCorrect
                  ? 'success'
                  : selectedAnswer === 'O' && !isCorrect
                    ? 'error'
                    : 'primary'
              }
            >
              O
            </TextBox>
          </GridQuizOptionCardBox>

          <GridQuizOptionCardBox
            $inRow
            $pressed={selectedAnswer === 'X' && !isCorrect}
            $isCorrect={selectedAnswer === 'X' && isCorrect}
            $isIncorrect={selectedAnswer === 'X' && !isCorrect}
            onClick={() => handleAnswer('X')}
            aria-label='X'
          >
            <TextBox
              fontSize={1.5}
              fontWeight={600}
              color={
                selectedAnswer === 'X' && isCorrect
                  ? 'success'
                  : selectedAnswer === 'X' && !isCorrect
                    ? 'error'
                    : 'primary'
              }
            >
              X
            </TextBox>
          </GridQuizOptionCardBox>
        </OptionCardsRow>
      </QuizBody>
    </QuizCorrectConfettiLayer>
  )
}

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

const WordArea = styled.div<{ $showResult?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1;
  min-width: 0;
  min-height: ${({ $showResult }) => ($showResult ? '108px' : '48px')};
  overflow: hidden;

  ${media.mobile} {
    min-height: ${({ $showResult }) => ($showResult ? '88px' : '40px')};
  }
`

const WordResultStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
`

const PromptWord = styled.span<{
  $strikethrough?: boolean
  $matchedCorrect?: boolean
}>`
  display: block;
  position: relative;
  font-family: 'Rg-B', sans-serif;
  font-size: 40px;
  font-weight: 600;
  color: #3c4b62;
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

  ${({ $strikethrough }) =>
    $strikethrough &&
    css`
      font-family: 'Rg-R', sans-serif;
      font-weight: normal;
      font-size: 30px;
      color: #a2b1c4;
      opacity: 0.7;

      ${media.mobile} {
        font-size: 22px;
      }

      &::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        top: 50%;
        height: 3px;
        margin-top: -1.5px;
        background-color: #a2b1c4;
        transform: scaleX(1);
        transform-origin: left center;
      }
    `}
`

const CorrectAnswerWord = styled.span<{ $visible?: boolean }>`
  display: block;
  font-family: 'Rg-B', sans-serif;
  font-size: 40px;
  font-weight: 600;
  color: #3c4b62;
  line-height: 1.2;
  text-align: center;
  pointer-events: none;
  max-height: ${({ $visible }) => ($visible ? '56px' : '0')};
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  overflow: hidden;
  will-change: transform, opacity, color;

  ${media.mobile} {
    font-size: 28px;
  }

  ${({ $visible }) =>
    $visible &&
    css`
      animation: ${wordTurnGreen} 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    `}
`
