import { useEffect, useMemo, useRef, useState } from 'react'

import shuffle from 'lodash/shuffle'
import type { MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { CardImageSkeleton } from '@components/atoms/study/cards/CardImageSkeleton'
import QuizComment from '@components/atoms/study/comments/QuizComment'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import { ListeningActivity4Card } from '@components/molecules/study/activities/listening-activity-04/ListeningActivity4Card'
import SelectionCardsColumn from '@components/molecules/study/layout/SelectionCardsColumn'
import QuestionImageFrameRounded from '@components/molecules/study/question/images/QuestionImageFrameRounded'
import type { AugmentOptions } from '@hooks/study/remix/useAugmentManager'
import { BaseQuiz } from '@hooks/study/remix/useQuizManager'
import { ACTIVITY_INSTRUCTIONS } from '@src/constants/study/activityInstructions'

type ListeningActivity4Props = {
  augmentOptions: AugmentOptions
  quizData: BaseQuiz
  onComplete: (isCorrect: boolean) => void
}

export default function ListeningActivity4({
  augmentOptions,
  quizData,
  onComplete,
}: ListeningActivity4Props) {
  const { t } = useTranslation()
  const [selectedText, setSelectedText] = useState<string | null>(null)
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  const [revealedIndex, setRevealedIndex] = useState<number | null>(null)
  const [hasUsedReveal, setHasUsedReveal] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const { showSentence, showAll } = augmentOptions.sentence

  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [])

  const handlePlaySound = (soundUrl: string, index: number) => {
    if (playingIndex === index) {
      audioRef.current?.pause()
      audioRef.current = null
      setPlayingIndex(null)
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    if (soundUrl) {
      const audio = new Audio(soundUrl)
      audioRef.current = audio

      audio.addEventListener('ended', () => {
        audioRef.current = null
        setPlayingIndex(null)
      })

      audio.play().catch((err) => {
        console.error('Audio play failed:', err)
        setPlayingIndex(null)
      })
      setPlayingIndex(index)
    }
  }

  const options = useMemo(
    () => shuffle([...(quizData.Examples ?? [])]),
    [quizData.QuizId, quizData.Examples],
  )

  const handleCardClick = (text: string) => {
    if (selectedText !== null) return
    setSelectedText(text)

    onComplete(text === quizData.Question.Text)
  }

  const handleRevealClick = (index: number) => {
    if (hasUsedReveal) return
    setRevealedIndex(index)
    setHasUsedReveal(true)
  }

  return (
    <>
      <QuizBody>
        <QuizComment>
          {t(ACTIVITY_INSTRUCTIONS.LISTENING_ACTIVITY4)}
        </QuizComment>

        <QuestionImageFrameRounded>
          {!imageLoaded && <CardImageSkeleton />}
          <img
            src={quizData.Question.Image}
            alt=''
            onLoad={() => setImageLoaded(true)}
            style={{ opacity: imageLoaded ? 1 : 0 }}
          />
        </QuestionImageFrameRounded>

        <SelectionCardsColumn>
          {options.map((opt, index) => (
            <ListeningActivity4Card
              key={opt.Text}
              text={opt.Text}
              isPressed={selectedText !== null && selectedText === opt.Text}
              isCorrect={
                selectedText !== null &&
                opt.Text === selectedText &&
                selectedText === quizData.Question.Text
              }
              isIncorrect={
                selectedText !== null &&
                opt.Text === selectedText &&
                selectedText !== quizData.Question.Text
              }
              isPlaying={playingIndex === index}
              onCardClick={() => handleCardClick(opt.Text)}
              onSoundClick={(e: MouseEvent) => {
                e.stopPropagation()
                handlePlaySound(opt.Sound, index)
              }}
              showTextDirectly={!showSentence || showAll}
              hasRevealButton={showSentence && !showAll}
              isRevealed={revealedIndex === index}
              isRevealDisabled={hasUsedReveal}
              onRevealClick={(e: MouseEvent) => {
                e.stopPropagation()
                handleRevealClick(index)
              }}
            />
          ))}
        </SelectionCardsColumn>
      </QuizBody>
    </>
  )
}
