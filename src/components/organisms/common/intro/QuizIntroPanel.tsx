import { useEffect, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { IconSoundPlay } from '@components/atoms/common/icons/IconSoundPlay'
import { IconSoundStop } from '@components/atoms/common/icons/IconSoundStop'
import IntroCoverBook from '@components/molecules/common/intro/IntroCoverBook'
import {
  IntroBackdrop,
  IntroColumn,
  IntroStartButton,
  IntroTitle,
} from '@components/molecules/common/intro/IntroLayout'

type QuizIntroPanelProps = {
  coverSrc: string
  onStart: () => void
  onClose: () => void
  /** PB 스토리 음원 URL — 존재 시 인트로 하단에 재생 토글 버튼 표시 */
  soundSrc?: string
  quizReward?: {
    tier: 'full' | 'half' | 'none'
    point: number
  }
}

export default function QuizIntroPanel({
  coverSrc,
  onStart,
  onClose,
  soundSrc,
  quizReward,
}: QuizIntroPanelProps) {
  const { t } = useTranslation()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (!soundSrc) return
    const audio = new Audio(soundSrc)
    audioRef.current = audio
    const handleEnded = () => setIsPlaying(false)
    audio.addEventListener('ended', handleEnded)
    return () => {
      audio.pause()
      audio.removeEventListener('ended', handleEnded)
      audioRef.current = null
    }
  }, [soundSrc])

  const toggleSound = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      audio.currentTime = 0
      setIsPlaying(false)
      return
    }
    void audio.play().then(
      () => setIsPlaying(true),
      () => setIsPlaying(false),
    )
  }

  return (
    <IntroBackdrop
      role='dialog'
      aria-modal='true'
      aria-labelledby='intro-title'
    >
      <IntroColumn>
        <IntroCoverBook coverSrc={coverSrc} />
        <TitleGroup>
          <TitleRow>
            <IntroTitle id='intro-title'>{t('intro.readyToQuiz')}</IntroTitle>
            {soundSrc && (
              <SoundToggle
                type='button'
                onClick={toggleSound}
                aria-label={t(
                  isPlaying ? 'common.stopAudio' : 'common.playAudio',
                )}
              >
                {isPlaying ? (
                  <IconSoundStop width={36} height={36} />
                ) : (
                  <IconSoundPlay width={36} height={36} />
                )}
              </SoundToggle>
            )}
          </TitleRow>
          {quizReward ? (
            <RewardMessage>
              {quizReward.tier === 'none'
                ? t('intro.quizRewardNone')
                : t(
                    quizReward.tier === 'full'
                      ? 'intro.quizRewardFull'
                      : 'intro.quizRewardHalf',
                    { point: quizReward.point },
                  )}
            </RewardMessage>
          ) : null}
        </TitleGroup>
        <IntroStartButton type='button' onClick={onStart}>
          Start
        </IntroStartButton>
        <CloseLink type='button' onClick={onClose}>
          Not Now
        </CloseLink>
      </IntroColumn>
    </IntroBackdrop>
  )
}

const CloseLink = styled.button`
  border: none;
  background: none;
  cursor: pointer;
  font-family: 'Rg-B', sans-serif;
  font-size: 1.1em;
  color: rgba(255, 255, 255, 0.7);
  padding: 4px 8px;

  &:hover {
    color: #fff;
  }
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
`

const TitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`

const RewardMessage = styled.p`
  margin: 0;
  padding: 0 16px;
  color: rgba(255, 255, 255, 0.85);
  font-family: 'Rg-B', sans-serif;
  font-size: 1rem;
  line-height: 1.45;
  text-align: center;
`

const SoundToggle = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.1s ease;

  &:active {
    transform: scale(0.9);
  }
`
