/** Practice A3 — 이미지에 맞는 영단어 2지선다 */
import { useEffect, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

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
import { generateWordPracticeImageChoiceRounds } from '@utils/generateWordPracticeQuiz'

const AUTO_ADVANCE_MS = 1500

type PracticeA3Props = {
  items: WordPracticeContentItem[]
  initialIndex?: number
  onComplete?: () => void
  onProgressChange?: (current: number, total: number) => void
}

export default function PracticeA3({
  items,
  initialIndex = 0,
  onComplete,
  onProgressChange,
}: PracticeA3Props) {
  const { t } = useTranslation()
  const wordPracticeScore = useWordPracticeScoreOptional()
  const [quizRounds] = useState(() =>
    generateWordPracticeImageChoiceRounds(items),
  )
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<0 | 1 | null>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const { confettiBurstKey, trigger, clearConfetti } =
    useQuizCorrectCelebration()
  const { triggerShake } = useQuizContainerShake()
  const { play: playIncorrectSound } = useIncorrectSoundPlayer()

  const currentItem = quizRounds[currentIndex]
  const isAnswered = selectedIndex !== null
  const isCorrect = selectedIndex === currentItem?.correctIndex

  useEffect(() => {
    onProgressChange?.(currentIndex + 1, quizRounds.length)
  }, [currentIndex, quizRounds.length, onProgressChange])

  useEffect(() => {
    setSelectedIndex(null)
    clearConfetti()
    setImageLoaded(false)

    const img = imageRef.current
    if (img?.complete && img.naturalWidth > 0) {
      setImageLoaded(true)
    }
  }, [currentIndex, clearConfetti])

  useEffect(() => {
    if (!isAnswered) return undefined

    const timer = window.setTimeout(() => {
      if (currentIndex >= quizRounds.length - 1) {
        onComplete?.()
        return
      }
      setCurrentIndex((prev) => prev + 1)
    }, AUTO_ADVANCE_MS)

    return () => window.clearTimeout(timer)
  }, [isAnswered, currentIndex, quizRounds.length, onComplete])

  const handleAnswer = (index: 0 | 1) => {
    if (isAnswered || !currentItem) return
    setSelectedIndex(index)

    const isChoiceCorrect = index === currentItem.correctIndex
    wordPracticeScore?.recordStepResult(
      currentItem.correctWord,
      'practice3',
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
        <QuizComment>{t(ACTIVITY_INSTRUCTIONS.PRACTICE_A3)}</QuizComment>

        <QuestionImageFrameVocabularyWide>
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
        </QuestionImageFrameVocabularyWide>

        <OptionCardsRow>
          {currentItem.options.map((word, index) => {
            const optionIndex = index as 0 | 1
            const isSelected = selectedIndex === optionIndex

            return (
              <ChoiceOptionCard
                key={`${currentItem.image}-${word}`}
                $pressed={isSelected && !isCorrect}
                $isCorrect={isSelected && isCorrect}
                $isIncorrect={isSelected && !isCorrect}
                onClick={() => handleAnswer(optionIndex)}
                aria-label={word}
              >
                <TextBox
                  fontSize={1.2}
                  fontWeight={600}
                  style={{ width: '100%', textAlign: 'center' }}
                  color={
                    isSelected && isCorrect
                      ? 'success'
                      : isSelected && !isCorrect
                        ? 'error'
                        : 'primary'
                  }
                >
                  {word}
                </TextBox>
              </ChoiceOptionCard>
            )
          })}
        </OptionCardsRow>
      </QuizBody>
    </QuizCorrectConfettiLayer>
  )
}

const ChoiceOptionCard = styled(GridQuizOptionCardBox).attrs({
  $inRow: true,
})`
  justify-content: center;
  text-align: center;
`
