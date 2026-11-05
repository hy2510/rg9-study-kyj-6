import { useCallback, useEffect, useRef, useState } from 'react'

import { media } from '@styles/tokens/breakpoints'
import { useTranslation } from 'react-i18next'
import styled, { css, keyframes } from 'styled-components'

import correctionCorrectSound from '@assets/sounds/common/correction-correct-sound.mp3'
import correctionIncorrectSound from '@assets/sounds/common/correction-incorrect-sound.mp3'
import { IconMicrophone } from '@components/atoms/common/icons/IconMicrophone'
import { IconSpeaker } from '@components/atoms/common/icons/IconSpeaker'

import {
  type RecordingResult,
  useVocaRecordingAnalysis,
} from '../../../hooks/story/useVocaRecordingAnalysis'

export type VocaSlide = {
  word: string
  sentence: string
  meaning: string
  speechPart: string
  soundUrl: string
  sentenceSoundUrl: string
  imageUrl: string
}

function normalizeDisplayText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

export type VocaWordCardProps = {
  slide: VocaSlide
  isLearned: boolean
  showMeaning: boolean
  showSentence: boolean
  isSentenceSoundPlaying?: boolean
  onPlaySound: (src?: string, onEnded?: () => void) => void
  pauseBookAudio: () => void
  onMarkLearned: () => void
}

export default function VocaWordCard({
  slide,
  isLearned,
  showMeaning,
  showSentence,
  isSentenceSoundPlaying = false,
  onPlaySound,
  pauseBookAudio,
  onMarkLearned,
}: VocaWordCardProps) {
  const { t } = useTranslation()
  const hasMeaning = showMeaning && slide.meaning.trim().length > 0
  const hasSentence =
    showSentence &&
    slide.sentence.trim().length > 0 &&
    normalizeDisplayText(slide.sentence) !== normalizeDisplayText(slide.word)
  const sentenceSoundUrl = slide.sentenceSoundUrl.trim()
  const hasSentenceSound = hasSentence && sentenceSoundUrl.length > 0
  const imageUrl = slide.imageUrl.trim()
  const hasImage = imageUrl.length > 0
  const [flipped, setFlipped] = useState(!hasImage)
  const flipSoundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const feedbackAudioRef = useRef<HTMLAudioElement | null>(null)
  const {
    isRecordingMode,
    isAnalyzing,
    recognizedText,
    recordingResult,
    resetRecordingAnalysis,
    startRecordingAnalysis,
  } = useVocaRecordingAnalysis({
    pauseBookAudio,
    targetWord: slide.word,
    targetSoundUrl: slide.soundUrl,
  })
  const answerResult =
    recordingResult === 'correct' || recordingResult === 'incorrect'
      ? recordingResult
      : undefined

  useEffect(() => {
    if (flipSoundTimerRef.current) {
      clearTimeout(flipSoundTimerRef.current)
      flipSoundTimerRef.current = null
    }
    resetRecordingAnalysis()
    setFlipped(!hasImage)
  }, [hasImage, resetRecordingAnalysis, slide.imageUrl])

  useEffect(() => {
    if (!answerResult) {
      feedbackAudioRef.current?.pause()
      feedbackAudioRef.current = null
      return
    }

    feedbackAudioRef.current?.pause()
    const audio = new Audio(
      answerResult === 'correct'
        ? correctionCorrectSound
        : correctionIncorrectSound,
    )
    feedbackAudioRef.current = audio
    audio.play().catch(() => {
      // 자동재생 정책 등으로 실패할 수 있어 무시합니다.
    })

    return () => {
      audio.pause()
    }
  }, [answerResult])

  useEffect(() => {
    if (answerResult !== 'incorrect') return

    const timer = setTimeout(() => {
      resetRecordingAnalysis()
    }, 1200)

    return () => clearTimeout(timer)
  }, [answerResult, resetRecordingAnalysis])

  useEffect(() => {
    if (answerResult !== 'correct') return

    onMarkLearned()
    const timer = setTimeout(() => {
      resetRecordingAnalysis()
    }, 1200)

    return () => clearTimeout(timer)
  }, [answerResult, onMarkLearned, resetRecordingAnalysis])

  useEffect(() => {
    return () => {
      if (flipSoundTimerRef.current) {
        clearTimeout(flipSoundTimerRef.current)
      }
      feedbackAudioRef.current?.pause()
    }
  }, [])

  const playSoundAfterFlip = useCallback(() => {
    if (flipSoundTimerRef.current) {
      clearTimeout(flipSoundTimerRef.current)
    }
    flipSoundTimerRef.current = setTimeout(() => {
      onPlaySound(
        undefined,
        hasSentenceSound ? () => onPlaySound(sentenceSoundUrl) : undefined,
      )
      flipSoundTimerRef.current = null
    }, 500)
  }, [hasSentenceSound, onPlaySound, sentenceSoundUrl])

  const flipToImage = useCallback(() => {
    if (!hasImage) return
    if (flipSoundTimerRef.current) {
      clearTimeout(flipSoundTimerRef.current)
      flipSoundTimerRef.current = null
    }
    resetRecordingAnalysis()
    setFlipped(false)
  }, [hasImage, resetRecordingAnalysis])

  const flipToWord = useCallback(() => {
    if (!hasImage) return
    resetRecordingAnalysis()
    setFlipped(true)
    playSoundAfterFlip()
  }, [hasImage, playSoundAfterFlip, resetRecordingAnalysis])

  const toggleFlip = useCallback(() => {
    if (isRecordingMode || isAnalyzing) return
    if (!hasImage) return
    if (flipped) {
      flipToImage()
      return
    }
    flipToWord()
  }, [flipToImage, flipToWord, flipped, hasImage, isAnalyzing, isRecordingMode])

  const playSoundByShortcut = useCallback(() => {
    if (isRecordingMode || isAnalyzing) return
    if (hasImage && !flipped) setFlipped(true)
    onPlaySound(
      undefined,
      hasSentenceSound ? () => onPlaySound(sentenceSoundUrl) : undefined,
    )
  }, [
    flipped,
    hasImage,
    hasSentenceSound,
    isRecordingMode,
    onPlaySound,
    sentenceSoundUrl,
  ])

  const handleStartRecording = useCallback(() => {
    if (isRecordingMode || isAnalyzing) return
    if (hasImage && !flipped) setFlipped(true)
    startRecordingAnalysis()
  }, [flipped, hasImage, isAnalyzing, isRecordingMode, startRecordingAnalysis])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return

      if (e.key === ' ' || e.code === 'Space' || e.key === 'Spacebar') {
        e.preventDefault()
        toggleFlip()
        return
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        playSoundByShortcut()
        return
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        handleStartRecording()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [playSoundByShortcut, handleStartRecording, toggleFlip])

  return (
    <Card $flipped={flipped}>
      <CardInner $flipped={flipped}>
        {hasImage ? (
          <CardFace $front>
            <ImageButton
              type='button'
              aria-label={slide.word}
              onClick={(e) => {
                e.stopPropagation()
                flipToWord()
              }}
            >
              <CardImage src={imageUrl} alt='' />
            </ImageButton>
          </CardFace>
        ) : null}

        <CardFace
          $back
          $clickable={hasImage}
          $recording={isRecordingMode}
          $result={answerResult}
          role={hasImage ? 'button' : undefined}
          tabIndex={hasImage ? 0 : undefined}
          onClick={(e) => {
            e.stopPropagation()
            flipToImage()
          }}
          onKeyDown={(e) => {
            if (!hasImage) return
            if (e.key !== 'Enter') return
            e.preventDefault()
            flipToImage()
          }}
        >
          {isRecordingMode ? (
            <StatusDot $status='recording' />
          ) : isLearned ? (
            <StatusDot $status='learned' />
          ) : null}
          <Headword
            $result={answerResult}
            $sentencePlaying={isSentenceSoundPlaying}
          >
            {slide.word}
          </Headword>
          {hasMeaning && !answerResult ? (
            <Subline>
              {slide.speechPart ? <Pos>{slide.speechPart}. </Pos> : null}
              {slide.meaning}
            </Subline>
          ) : null}
          {hasSentence && !isRecordingMode && !answerResult ? (
            <SentenceLine
              $sentencePlaying={isSentenceSoundPlaying}
              dangerouslySetInnerHTML={{ __html: slide.sentence }}
            />
          ) : null}
          {recordingResult && !answerResult ? (
            <RecordResult $result={recordingResult}>
              {recordingResult === 'correct'
                ? 'Correct!'
                : recordingResult === 'incorrect'
                  ? 'Try again'
                  : recordingResult === 'unsupported'
                    ? 'Voice recognition is not supported.'
                    : 'Could not analyze your voice.'}
              {recognizedText ? (
                <RecognizedText>{`"${recognizedText}"`}</RecognizedText>
              ) : null}
            </RecordResult>
          ) : null}
          {!answerResult ? (
            <>
              <RecordBtn
                type='button'
                aria-label='녹음하기'
                aria-disabled={isRecordingMode || isAnalyzing}
                $disabledVisual={isRecordingMode || isAnalyzing}
                onClick={(e) => {
                  e.stopPropagation()
                  handleStartRecording()
                }}
              >
                <IconMicrophone width={50} height={50} />
              </RecordBtn>
              <SoundBtn
                type='button'
                aria-label={t('story.vocaPlayPronunciation')}
                aria-disabled={isRecordingMode || isAnalyzing}
                $disabledVisual={isRecordingMode || isAnalyzing}
                onClick={(e) => {
                  e.stopPropagation()
                  if (isRecordingMode || isAnalyzing) return
                  onPlaySound(
                    undefined,
                    hasSentenceSound
                      ? () => onPlaySound(sentenceSoundUrl)
                      : undefined,
                  )
                }}
              >
                <IconSpeaker width={50} height={50} />
              </SoundBtn>
            </>
          ) : null}
        </CardFace>
      </CardInner>
    </Card>
  )
}

const recordingDotBlink = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.35;
    transform: scale(0.72);
  }
`

const recordingBorderWave = keyframes`
  0% {
    box-shadow:
      0 0 0 0 rgba(239, 61, 100, 0.38),
      0 0 0 0 rgba(239, 61, 100, 0.22);
  }
  70% {
    box-shadow:
      0 0 0 8px rgba(239, 61, 100, 0),
      0 0 0 18px rgba(239, 61, 100, 0);
  }
  100% {
    box-shadow:
      0 0 0 0 rgba(239, 61, 100, 0),
      0 0 0 0 rgba(239, 61, 100, 0);
  }
`

const Card = styled.div<{ $flipped: boolean }>`
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  min-height: 260px;
  perspective: 1000px;
  flex-shrink: 0;
  text-align: center;
  cursor: ${(p) => (p.$flipped ? 'default' : 'pointer')};
`

const CardInner = styled.div<{ $flipped: boolean }>`
  position: relative;
  width: 100%;
  min-height: 260px;
  transform-style: preserve-3d;
  transform: ${(p) => (p.$flipped ? 'rotateY(180deg)' : 'none')};
  transition: transform 0.45s ease;
`

const CardFace = styled.div<{
  $front?: boolean
  $back?: boolean
  $clickable?: boolean
  $recording?: boolean
  $result?: RecordingResult
}>`
  position: absolute;
  inset: 0;
  box-sizing: border-box;
  min-height: 260px;
  padding: ${(p) => (p.$front ? '0' : '40px 28px 52px')};
  border-radius: 30px;
  border: 2px solid
    ${(p) => (p.$recording && !p.$result ? '#ef3d64' : 'transparent')};
  background: ${(p) => {
    if (p.$result === 'correct') return '#d7ffc8'
    if (p.$result === 'incorrect') return '#fff0f3'
    if (p.$front || p.$recording) return '#fff'
    return 'rgb(233, 237, 243, 0.5)'
  }};
  backface-visibility: hidden;
  overflow: ${(p) => (p.$recording && !p.$result ? 'visible' : 'hidden')};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transform: ${(p) => (p.$back ? 'rotateY(180deg)' : 'none')};
  cursor: ${(p) => (p.$clickable ? 'pointer' : 'default')};
  ${(p) =>
    p.$recording && !p.$result
      ? css`
          animation: ${recordingBorderWave} 1.35s ease-out infinite;

          &::after {
            content: '';
            position: absolute;
            inset: -2px;
            border: 2px solid rgba(239, 61, 100, 0.28);
            border-radius: inherit;
            pointer-events: none;
            animation: ${recordingBorderWave} 1.35s ease-out infinite;
          }
        `
      : ''}

  ${media.mobile} {
    ${(p) =>
      p.$front
        ? css`
            position: relative;
            inset: auto;
            min-height: 260px;
          `
        : ''}
  }
`

const StatusDot = styled.span<{ $status: 'recording' | 'learned' }>`
  position: absolute;
  top: 14px;
  left: 14px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: ${(p) => (p.$status === 'learned' ? '#12966b' : '#ef3d64')};
  ${(p) =>
    p.$status === 'recording'
      ? css`
          animation: ${recordingDotBlink} 0.9s ease-in-out infinite;
        `
      : ''}
`

const ImageButton = styled.button`
  width: 100%;
  min-height: 260px;
  border: none;
  padding: 0;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  ${media.mobile} {
    min-height: 260px;
  }
`

const CardImage = styled.img`
  display: block;
  width: auto;
  height: 100%;

  ${media.mobile} {
    width: 100%;
    height: auto;
    max-width: 100%;
  }
`

const Headword = styled.p<{
  $result?: RecordingResult
  $sentencePlaying?: boolean
}>`
  margin: 0;
  font-size: ${(p) => (p.$sentencePlaying ? '0.75rem' : '2rem')};
  font-weight: ${(p) => (p.$sentencePlaying ? 600 : 800)};
  color: ${(p) => {
    if (p.$result === 'correct') return '#12966b'
    if (p.$result === 'incorrect') return '#ef3d64'
    if (p.$sentencePlaying) return '#64748b'
    return '#334155'
  }};
  font-family: 'Rg-B', 'Fredoka', sans-serif;
  letter-spacing: -0.03em;
  line-height: 1.2;
  transition:
    font-size 0.3s ease,
    font-weight 0.3s ease,
    color 0.3s ease;
`

const Subline = styled.p`
  margin: 12px 0 0;
  font-size: 0.95rem;
  font-weight: 500;
  color: #64748b;
  line-height: 1.45;
  max-width: 100%;
`

const SentenceLine = styled.p<{ $sentencePlaying?: boolean }>`
  margin: 12px 0 0;
  max-width: 100%;
  color: ${(p) => (p.$sentencePlaying ? '#334155' : '#64748b')};
  font-family: 'Rg-R', 'Fredoka', sans-serif;
  font-size: 1.25rem;
  font-weight: ${(p) => (p.$sentencePlaying ? 800 : 600)};
  line-height: 1.45;
  text-align: center;
  transition:
    font-size 0.3s ease,
    font-weight 0.3s ease,
    color 0.3s ease;
`

const RecordResult = styled.div<{ $result: RecordingResult }>`
  margin-top: 14px;
  font-size: 0.95rem;
  font-weight: 800;
  line-height: 1.35;
  color: ${(p) => (p.$result === 'correct' ? '#199261' : '#ef3d64')};
`

const RecognizedText = styled.div`
  margin-top: 4px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #94a3b8;
`

const Pos = styled.span`
  font-size: 0.8rem;
  font-style: italic;
  color: #94a3b8;
`

const SoundBtn = styled.button<{ $disabledVisual?: boolean }>`
  position: absolute;
  right: 15px;
  bottom: 15px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${(p) => (p.$disabledVisual ? 'not-allowed' : 'pointer')};
  background: transparent;
  opacity: ${(p) => (p.$disabledVisual ? 0.32 : 1)};
  filter: ${(p) => (p.$disabledVisual ? 'grayscale(0.4)' : 'none')};
  transition:
    opacity 0.18s ease,
    filter 0.18s ease,
    transform 0.15s ease;

  &:active {
    transform: scale(0.96);
  }

  img {
    display: block;
  }
`

const RecordBtn = styled(SoundBtn)`
  right: 75px;
`
