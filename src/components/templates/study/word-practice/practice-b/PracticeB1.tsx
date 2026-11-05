/** Practice B1 — 한글 뜻을 보고 맞는 영단어 4지선다 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { media } from '@styles/tokens/breakpoints'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import QuizComment from '@components/atoms/study/comments/QuizComment'
import QuizCorrectConfettiLayer from '@components/atoms/study/feedback/QuizCorrectConfettiLayer'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import { GridQuizOptionCardBox } from '@components/molecules/study/quizOptions/cards/GridQuizOptionCardBox'
import { ACTIVITY_INSTRUCTIONS } from '@constants/study/activityInstructions'
import { useWordPracticeScoreOptional } from '@contexts/WordPracticeScoreContext'
import { useIncorrectSoundPlayer } from '@hooks/study/useIncorrectSoundPlayer'
import { useQuizContainerShake } from '@hooks/study/useQuizContainerShake'
import { useQuizCorrectCelebration } from '@hooks/study/useQuizCorrectCelebration'
import type { WordMeaningPracticeItem } from '@interfaces/study/word-practice/wordMeaningPractice'
import { generateWordMeaningChoiceRounds } from '@utils/generateWordMeaningPracticeQuiz'

const AUTO_ADVANCE_MS = 1500

type ChoiceIndex = 0 | 1 | 2 | 3

type PracticeB1Props = {
  items: WordMeaningPracticeItem[]
  initialIndex?: number
  onComplete?: () => void
  onProgressChange?: (current: number, total: number) => void
}

export default function PracticeB1({
  items,
  initialIndex = 0,
  onComplete,
  onProgressChange,
}: PracticeB1Props) {
  const { t } = useTranslation()
  const wordPracticeScore = useWordPracticeScoreOptional()
  const quizRounds = useMemo(
    () => generateWordMeaningChoiceRounds(items),
    [items],
  )
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [selectedIndex, setSelectedIndex] = useState<ChoiceIndex | null>(null)
  const wordAudioRef = useRef<HTMLAudioElement | null>(null)
  const { confettiBurstKey, trigger, clearConfetti } =
    useQuizCorrectCelebration()
  const { triggerShake } = useQuizContainerShake()
  const { play: playIncorrectSound } = useIncorrectSoundPlayer()

  const currentItem = quizRounds[currentIndex]
  const isAnswered = selectedIndex !== null
  const isCorrect = selectedIndex === currentItem?.correctIndex

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
  }, [currentIndex, onComplete, quizRounds.length])

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

  useEffect(() => {
    onProgressChange?.(currentIndex + 1, quizRounds.length)
  }, [currentIndex, onProgressChange, quizRounds.length])

  useEffect(() => {
    setSelectedIndex(null)
    clearConfetti()
    stopWordAudio()
  }, [clearConfetti, currentIndex, stopWordAudio])

  useEffect(() => {
    return () => {
      stopWordAudio()
    }
  }, [stopWordAudio])

  useEffect(() => {
    if (!isAnswered) return undefined

    const timer = window.setTimeout(() => {
      playWordSoundAndAdvance()
    }, AUTO_ADVANCE_MS)

    return () => window.clearTimeout(timer)
  }, [isAnswered, playWordSoundAndAdvance])

  const handleAnswer = (index: ChoiceIndex) => {
    if (isAnswered || !currentItem) return
    setSelectedIndex(index)

    const isChoiceCorrect = index === currentItem.correctIndex
    wordPracticeScore?.recordStepResult(
      currentItem.correctWord,
      'practiceB1',
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

  return (
    <QuizCorrectConfettiLayer
      burstKey={confettiBurstKey}
      onBurstEnd={clearConfetti}
    >
      <QuizBody>
        <QuizComment>{t(ACTIVITY_INSTRUCTIONS.PRACTICE_B1)}</QuizComment>

        <PromptPanel>
          <MeaningPrompt>{currentItem.meaning}</MeaningPrompt>
        </PromptPanel>

        <OptionsGrid>
          {currentItem.options.map((word, index) => {
            const optionIndex = index as ChoiceIndex
            const isSelected = selectedIndex === optionIndex

            return (
              <ChoiceOptionCard
                key={`${currentItem.meaning}-${word}`}
                $pressed={isSelected && !isCorrect}
                $isCorrect={isSelected && isCorrect}
                $isIncorrect={isSelected && !isCorrect}
                onClick={() => handleAnswer(optionIndex)}
                aria-label={word}
              >
                <WordOptionLabel
                  $tone={
                    isSelected && isCorrect
                      ? 'success'
                      : isSelected && !isCorrect
                        ? 'error'
                        : 'primary'
                  }
                >
                  {word}
                </WordOptionLabel>
              </ChoiceOptionCard>
            )
          })}
        </OptionsGrid>
      </QuizBody>
    </QuizCorrectConfettiLayer>
  )
}

const PromptPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  padding: 40px 0;

  ${media.mobile} {
    padding: 20px 0;
    gap: 12px;
  }
`

const MeaningPrompt = styled.p`
  margin: 0;
  font-family: 'Rg-B', sans-serif;
  font-size: 36px;
  font-weight: 600;
  line-height: 1.2;
  color: #3c4b62;
  text-align: center;

  ${media.mobile} {
    font-size: 24px;
  }
`

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  width: 100%;
  align-items: stretch;

  ${media.mobile} {
    gap: 8px;
  }
`

const ChoiceOptionCard = styled(GridQuizOptionCardBox)`
  width: 100%;
  height: 100%;
  justify-content: center;
  min-height: 80px;

  ${media.mobile} {
    min-height: 60px;
  }
`

const WordOptionLabel = styled.span<{
  $tone: 'primary' | 'success' | 'error'
}>`
  font-family: 'Rg-B', sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.2;
  text-align: center;
  color: ${({ $tone }) =>
    $tone === 'success'
      ? '#1baa70'
      : $tone === 'error'
        ? '#ef3d2e'
        : '#3c4b62'};

  ${media.mobile} {
    font-size: 16px;
  }
`
