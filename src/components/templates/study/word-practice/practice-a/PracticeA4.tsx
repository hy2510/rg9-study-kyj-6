/** Practice A4 — 음성을 듣고 맞는 영단어 2지선다 */
import { useCallback, useEffect, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import soundPlayIcon from '@assets/icons/sound-play.svg'
import soundStopIcon from '@assets/icons/sound-stop.svg'
import TextBox from '@components/atoms/common/TextBox'
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
import { generateWordPracticeSoundChoiceRounds } from '@utils/generateWordPracticeQuiz'

const AUTO_ADVANCE_MS = 1500
const SOUND_BUTTON_SIZE_PX = 60

type PracticeA4Props = {
  items: WordPracticeContentItem[]
  initialIndex?: number
  onComplete?: () => void
  onProgressChange?: (current: number, total: number) => void
}

export default function PracticeA4({
  items,
  initialIndex = 0,
  onComplete,
  onProgressChange,
}: PracticeA4Props) {
  const { t } = useTranslation()
  const wordPracticeScore = useWordPracticeScoreOptional()
  const [quizRounds] = useState(() =>
    generateWordPracticeSoundChoiceRounds(items),
  )
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [selectedIndex, setSelectedIndex] = useState<0 | 1 | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
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
    setIsPlaying(false)
  }, [])

  const playWordAudio = useCallback(() => {
    if (!currentItem?.sound) return

    stopWordAudio()
    const audio = new Audio(currentItem.sound)
    wordAudioRef.current = audio

    const clearPlaying = () => {
      if (wordAudioRef.current === audio) {
        wordAudioRef.current = null
        setIsPlaying(false)
      }
    }

    audio.addEventListener('play', () => setIsPlaying(true))
    audio.addEventListener('ended', clearPlaying)
    audio.addEventListener('error', clearPlaying)
    audio.play().catch(clearPlaying)
  }, [currentItem, stopWordAudio])

  useEffect(() => {
    onProgressChange?.(currentIndex + 1, quizRounds.length)
  }, [currentIndex, quizRounds.length, onProgressChange])

  useEffect(() => {
    setSelectedIndex(null)
    clearConfetti()
    stopWordAudio()
    playWordAudio()
  }, [currentIndex, clearConfetti, stopWordAudio, playWordAudio])

  useEffect(() => {
    return () => {
      stopWordAudio()
    }
  }, [stopWordAudio])

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

  const handleSoundToggle = () => {
    if (isAnswered) return
    if (isPlaying) {
      stopWordAudio()
      return
    }
    playWordAudio()
  }

  const handleAnswer = (index: 0 | 1) => {
    if (isAnswered || !currentItem) return
    stopWordAudio()
    setSelectedIndex(index)

    const isChoiceCorrect = index === currentItem.correctIndex
    wordPracticeScore?.recordStepResult(
      currentItem.correctWord,
      'practice4',
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
        <QuizComment>{t(ACTIVITY_INSTRUCTIONS.PRACTICE_A4)}</QuizComment>

        <SoundButtonFrame>
          <SoundToggleButton
            type='button'
            onClick={handleSoundToggle}
            disabled={isAnswered}
            aria-label={isPlaying ? '음원 정지' : '음원 재생'}
            aria-pressed={isPlaying}
          >
            <img
              src={isPlaying ? soundStopIcon : soundPlayIcon}
              width={SOUND_BUTTON_SIZE_PX}
              height={SOUND_BUTTON_SIZE_PX}
              alt=''
            />
          </SoundToggleButton>
        </SoundButtonFrame>

        <OptionCardsRow>
          {currentItem.options.map((word, index) => {
            const optionIndex = index as 0 | 1
            const isSelected = selectedIndex === optionIndex

            return (
              <ChoiceOptionCard
                key={`${currentItem.sound}-${word}`}
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

const SoundButtonFrame = styled(QuestionImageFrameVocabularyWide)`
  img {
    display: block;
    width: ${SOUND_BUTTON_SIZE_PX}px;
    height: ${SOUND_BUTTON_SIZE_PX}px;
    min-width: 0;
  }
`

const SoundToggleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: transform 0.05s ease;

  &:active:not(:disabled) {
    transform: scale(0.98) translateY(1px);
  }

  &:disabled {
    cursor: default;
  }
`

const ChoiceOptionCard = styled(GridQuizOptionCardBox).attrs({
  $inRow: true,
})`
  justify-content: center;
  text-align: center;
`
