/** Practice A1 — 이미지 탭 시 단어 공개 + 발음 재생(단어 소개) */
import { useCallback, useEffect, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'

import TextBox from '@components/atoms/common/TextBox'
import { CardImageSkeleton } from '@components/atoms/study/cards/CardImageSkeleton'
import QuizComment from '@components/atoms/study/comments/QuizComment'
import QuizCorrectConfettiLayer from '@components/atoms/study/feedback/QuizCorrectConfettiLayer'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import QuestionImageFrameVocabularyWide from '@components/molecules/study/question/images/QuestionImageFrameVocabularyWide'
import { GridQuizOptionCardBox } from '@components/molecules/study/quizOptions/cards/GridQuizOptionCardBox'
import { ACTIVITY_INSTRUCTIONS } from '@constants/study/activityInstructions'
import { useQuizCorrectCelebration } from '@hooks/study/useQuizCorrectCelebration'
import type { WordPracticeContentItem } from '@interfaces/study/word-practice/wordPractice'

type PracticeA1Props = {
  items: WordPracticeContentItem[]
  initialIndex?: number
  onComplete?: () => void
  onProgressChange?: (current: number, total: number) => void
}

export default function PracticeA1({
  items,
  initialIndex = 0,
  onComplete,
  onProgressChange,
}: PracticeA1Props) {
  const { t } = useTranslation()
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isWordRevealed, setIsWordRevealed] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  const wordAudioRef = useRef<HTMLAudioElement | null>(null)
  const shouldPlayWordSoundRef = useRef(false)
  const { confettiBurstKey, trigger, clearConfetti } =
    useQuizCorrectCelebration()

  const currentItem = items[currentIndex]

  const stopWordAudio = useCallback(() => {
    const audio = wordAudioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
      wordAudioRef.current = null
    }
  }, [])

  const advanceToNext = useCallback(() => {
    if (currentIndex >= items.length - 1) {
      onComplete?.()
      return
    }
    setCurrentIndex((prev) => prev + 1)
  }, [currentIndex, items.length, onComplete])

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
    if (!shouldPlayWordSoundRef.current) return
    shouldPlayWordSoundRef.current = false
    playWordSoundAndAdvance()
  }, [clearConfetti, playWordSoundAndAdvance])

  useEffect(() => {
    onProgressChange?.(currentIndex + 1, items.length)
  }, [currentIndex, items.length, onProgressChange])

  useEffect(() => {
    setIsWordRevealed(false)
    shouldPlayWordSoundRef.current = false
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

  const handleReveal = () => {
    if (isWordRevealed || !currentItem) return
    setIsWordRevealed(true)
    shouldPlayWordSoundRef.current = true
    trigger()
  }

  if (!currentItem) return null

  return (
    <QuizCorrectConfettiLayer
      burstKey={confettiBurstKey}
      onBurstEnd={handleBurstEnd}
    >
      <QuizBody>
        <QuizComment>{t(ACTIVITY_INSTRUCTIONS.PRACTICE_A1)}</QuizComment>

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

        <GridQuizOptionCardBox
          $pressed={false}
          $isCorrect={isWordRevealed}
          onClick={handleReveal}
          aria-label={isWordRevealed ? currentItem.word : '단어 확인'}
        >
          {isWordRevealed ? (
            <TextBox fontSize={1.5} fontWeight={600} color='success'>
              {currentItem.word}
            </TextBox>
          ) : (
            <TextBox fontSize={1.5} fontWeight={600} color='primary'>
              ?
            </TextBox>
          )}
        </GridQuizOptionCardBox>
      </QuizBody>
    </QuizCorrectConfettiLayer>
  )
}
