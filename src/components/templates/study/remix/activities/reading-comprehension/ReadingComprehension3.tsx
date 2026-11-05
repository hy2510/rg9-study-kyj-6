import { useEffect, useMemo, useRef, useState } from 'react'

import shuffle from 'lodash/shuffle'
import type { MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { styled } from 'styled-components'

import TextBox from '@components/atoms/common/TextBox'
import { CardImageSkeleton } from '@components/atoms/study/cards/CardImageSkeleton'
import QuizComment from '@components/atoms/study/comments/QuizComment'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import { ButtonSoundPlay } from '@components/molecules/study/audio/ButtonSoundPlay'
import QuestionImageFrameRounded from '@components/molecules/study/question/images/QuestionImageFrameRounded'
import QuestionSoundButton from '@components/molecules/study/question/QuestionSoundButton'
import { SoundTextQuizRowCard } from '@components/molecules/study/quizOptions/cards/SoundTextQuizRowCard'
import type { AugmentOptions } from '@hooks/study/remix/useAugmentManager'
import { BaseQuiz } from '@hooks/study/remix/useQuizManager'

type ReadingComprehension3Props = {
  augmentOptions: AugmentOptions
  quizData: BaseQuiz
  onComplete: (isCorrect: boolean) => void
}

export default function ReadingComprehension3({
  augmentOptions,
  quizData,
  onComplete,
}: ReadingComprehension3Props) {
  const { t } = useTranslation()

  const correctExample = quizData.Examples[0].Text
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

    onComplete(text === correctExample)
  }

  return (
    <>
      <QuizBody>
        <QuizComment>
          {t('study.instructionImageSentence')}
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

        {quizData.Question.Text && (
          <ReadingComprehension3QuestionContainer>
            <TextBox fontSize={1.5} fontWeight={600} color='primary'>
              <span
                dangerouslySetInnerHTML={{ __html: quizData.Question.Text }}
              />
            </TextBox>
          </ReadingComprehension3QuestionContainer>
        )}

        <ReadingComprehension3CardsContainer>
          {options.map((opt, index) => (
            <SoundTextQuizRowCard
              key={opt.Text}
              text={opt.Text}
              isPressed={selectedText !== null && selectedText === opt.Text}
              isCorrect={
                selectedText !== null &&
                opt.Text === selectedText &&
                selectedText === correctExample
              }
              isIncorrect={
                selectedText !== null &&
                opt.Text === selectedText &&
                selectedText !== correctExample
              }
              isPlaying={playingIndex === index}
              onCardClick={() => handleCardClick(opt.Text)}
              onSoundClick={(e: MouseEvent) => {
                e.stopPropagation()
                handlePlaySound(opt.Sound, index)
              }}
            />
          ))}
        </ReadingComprehension3CardsContainer>
      </QuizBody>
    </>
  )
}

const ReadingComprehension3QuestionContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
`

const ReadingComprehension3CardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`
