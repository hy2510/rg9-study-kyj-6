import { useEffect, useMemo, useRef, useState } from 'react'

import shuffle from 'lodash/shuffle'
import type { MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { styled } from 'styled-components'

import { CardImageSkeleton } from '@components/atoms/study/cards/CardImageSkeleton'
import QuizComment from '@components/atoms/study/comments/QuizComment'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import QuestionImageFrameRounded from '@components/molecules/study/question/images/QuestionImageFrameRounded'
import { SoundTextQuizRowCard } from '@components/molecules/study/quizOptions/cards/SoundTextQuizRowCard'
import type { AugmentOptions } from '@hooks/study/remix/useAugmentManager'
import { BaseQuiz } from '@hooks/study/remix/useQuizManager'
import { ACTIVITY_INSTRUCTIONS } from '@src/constants/study/activityInstructions'

type ReadingComprehension2Props = {
  augmentOptions: AugmentOptions
  quizData: BaseQuiz
  onComplete: (isCorrect: boolean) => void
}

export default function ReadingComprehension2({
  augmentOptions,
  quizData,
  onComplete,
}: ReadingComprehension2Props) {
  const { t } = useTranslation()
  const [selectedText, setSelectedText] = useState<string | null>(null)
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [imageLoaded, setImageLoaded] = useState(false)

  const options = useMemo(
    () => shuffle([...(quizData.Examples ?? [])]),
    [quizData.QuizId, quizData.Examples],
  )

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

  const handleCardClick = (text: string) => {
    if (selectedText !== null) return // 이미 선택됨
    setSelectedText(text)

    onComplete(text === quizData.Question.Text)
  }

  return (
    <>
      <QuizBody>
        <QuizComment>
          {t(ACTIVITY_INSTRUCTIONS.READING_COMPREHENSION2)}
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
        <ReadingComprehension2CardsContainer>
          {options.map((opt, index) => (
            <SoundTextQuizRowCard
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
            />
          ))}
        </ReadingComprehension2CardsContainer>
      </QuizBody>
    </>
  )
}

const ReadingComprehension2CardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`
