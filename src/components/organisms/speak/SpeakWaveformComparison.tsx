import { useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'
import styled, { css, keyframes } from 'styled-components'

import { IconSpeakerWhite } from '@components/atoms/common/icons/IconSpeakerWhite'
import {
  decodeAudio,
  getAudioContextConstructor,
} from '@utils/speak/speakWaveformAudio'
import {
  getCachedOriginalBuffer,
  setCachedOriginalBuffer,
} from '@utils/speak/speakWaveformCache'
import {
  extractPeaks,
  getSoundDuration,
  makeWavePath,
  normalizeTogether,
  VIEWBOX_HEIGHT,
  VIEWBOX_WIDTH,
  WAVEFORM_BASELINE_Y,
  WaveformData,
} from '@utils/speak/speakWaveformPeaks'

type SpeakWaveformComparisonProps = {
  originalAudioUrl: string
  userAudioUrl?: string
  isOriginalPlaying: boolean
  isUserPlaying: boolean
  disabled: boolean
  onPlayOriginal: () => void
  onPlayUser: () => void
  playbackProgress: number
  playbackColor: 'green' | 'red'
  onReadyChange?: (ready: boolean) => void
}

export default function SpeakWaveformComparison({
  originalAudioUrl,
  userAudioUrl,
  isOriginalPlaying,
  isUserPlaying,
  disabled,
  onPlayOriginal,
  onPlayUser,
  playbackProgress,
  playbackColor,
  onReadyChange,
}: SpeakWaveformComparisonProps) {
  const { t } = useTranslation()
  const [waveforms, setWaveforms] = useState<WaveformData>()

  useEffect(() => {
    let cancelled = false
    setWaveforms(undefined)
    onReadyChange?.(false)

    const AudioContextConstructor = getAudioContextConstructor()
    if (!AudioContextConstructor || !originalAudioUrl) return
    const context = new AudioContextConstructor()

    const cachedOriginal = getCachedOriginalBuffer(originalAudioUrl)
    const originalPromise: Promise<AudioBuffer> = cachedOriginal
      ? Promise.resolve(cachedOriginal)
      : decodeAudio(context, originalAudioUrl).then((buffer) => {
          setCachedOriginalBuffer(originalAudioUrl, buffer)
          return buffer
        })

    void Promise.all([
      originalPromise,
      userAudioUrl
        ? decodeAudio(context, userAudioUrl)
        : Promise.resolve(undefined),
    ])
      .then(([originalBuffer, userBuffer]) => {
        if (cancelled) return
        // 공통 timelineDuration 으로 샘플링하면 짧은 쪽 파형이 그래프 중간부터
        // 평평해져 "파형이 끝까지 안 간 것"처럼 보이는 UX 이슈가 발생한다.
        // 각 버퍼를 자신의 duration 전체 범위로 샘플링해 그래프 폭을 꽉 채운다.
        // 유저 녹음은 MediaRecorder 가 maxDurationMs 전체를 녹음해 뒤가 무음으로 채워질 수
        // 있으므로 실제 소리 끝 지점까지만 샘플링 범위를 좁혀 SVG 폭에 꽉 채워 그린다.
        // userDuration 도 같은 soundDuration 으로 통일해야 ProgressFill 애니메이션
        // (fillToEnd ${userDuration}s) 이 파형 폭을 정확히 따라가며 음원과 싱크된다.
        const userSoundDuration = userBuffer ? getSoundDuration(userBuffer) : 0
        setWaveforms(
          normalizeTogether({
            original: extractPeaks(originalBuffer, originalBuffer.duration),
            user: userBuffer ? extractPeaks(userBuffer, userSoundDuration) : [],
            originalDuration: originalBuffer.duration,
            userDuration: userSoundDuration,
          }),
        )
        onReadyChange?.(true)
      })
      .catch(() => {})

    return () => {
      cancelled = true
      void context.close()
    }
  }, [originalAudioUrl, userAudioUrl, onReadyChange])

  if (!waveforms) return null

  return (
    <ComparisonContainer>
      <AudioControls>
        <AudioButton
          type='button'
          $color='#159367'
          $active={isOriginalPlaying}
          disabled={disabled || isUserPlaying || isOriginalPlaying}
          onClick={onPlayOriginal}
          aria-label={t('speak.originalVoice')}
        >
          <SpeakerIcon $variant='green' aria-hidden>
            <IconSpeakerWhite width={28} height={28} />
          </SpeakerIcon>
          {t('speak.originalWave')}
        </AudioButton>
        {userAudioUrl ? (
          <AudioButton
            type='button'
            $color='#dc3157'
            $active={isUserPlaying}
            disabled={disabled || isOriginalPlaying}
            onClick={onPlayUser}
            aria-label={t('speak.myVoice')}
          >
            <SpeakerIcon $variant='red' aria-hidden>
              <IconSpeakerWhite width={28} height={28} />
            </SpeakerIcon>
            {t('speak.myWave')}
          </AudioButton>
        ) : null}
      </AudioControls>
      <WaveformArea>
        <ProgressFill
          $progress={playbackProgress}
          $color={playbackColor}
          $playing={isOriginalPlaying || isUserPlaying}
          $duration={
            isUserPlaying ? waveforms.userDuration : waveforms.originalDuration
          }
          aria-hidden
        />
        <WaveformSvg
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          role='img'
          aria-label={t('speak.waveformComparison')}
          preserveAspectRatio='none'
        >
          <CenterLine
            x1='0'
            x2={VIEWBOX_WIDTH}
            y1={WAVEFORM_BASELINE_Y}
            y2={WAVEFORM_BASELINE_Y}
          />
          <OriginalWave d={makeWavePath(waveforms.original)} />
          {waveforms.user.length > 0 ? (
            <UserWave d={makeWavePath(waveforms.user)} />
          ) : null}
        </WaveformSvg>
      </WaveformArea>
    </ComparisonContainer>
  )
}

const ComparisonContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 5px;
`

const AudioControls = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 18px;
`

const AudioButton = styled.button<{ $color: string; $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 8px;
  border: 0;
  border-radius: 10px;
  background: ${({ $active, $color }) =>
    $active ? `${$color}18` : 'transparent'};
  color: ${({ $color }) => $color};
  font-family: 'Rg-R', 'Chiron GoRound TC', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.42;
  }
`

const SpeakerIcon = styled.span<{ $variant: 'green' | 'red' }>`
  display: inline-flex;
  width: 28px;
  height: 28px;
  flex: 0 0 28px;

  img {
    filter: ${({ $variant }) =>
      $variant === 'green'
        ? 'brightness(0) saturate(100%) invert(48%) sepia(78%) saturate(443%) hue-rotate(108deg) brightness(82%) contrast(91%)'
        : 'brightness(0) saturate(100%) invert(27%) sepia(96%) saturate(2656%) hue-rotate(329deg) brightness(91%) contrast(90%)'};
  }
`

const WaveformArea = styled.div`
  position: relative;
  width: 100%;
  height: 94px;
  overflow: hidden;
  border: 1px solid #e9edf3;
  box-sizing: border-box;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.72);
`

const fillToEnd = keyframes`
  from { width: 0%; }
  to { width: 100%; }
`

const ProgressFill = styled.div<{
  $progress: number
  $color: 'green' | 'red'
  $playing: boolean
  $duration: number
}>`
  position: absolute;
  inset: 0 auto 0 0;
  width: ${({ $progress }) => `${Math.min(1, Math.max(0, $progress)) * 100}%`};
  background: ${({ $color }) =>
    $color === 'green'
      ? 'rgba(32, 173, 117, 0.16)'
      : 'rgba(239, 61, 100, 0.14)'};
  ${({ $playing, $duration }) =>
    $playing && $duration > 0
      ? css`
          animation: ${fillToEnd} ${$duration}s linear forwards;
        `
      : css`
          animation: none;
        `}
  pointer-events: none;
`

const WaveformSvg = styled.svg`
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
`

const CenterLine = styled.line`
  stroke: rgba(82, 97, 116, 0.18);
  stroke-width: 1;
`

const OriginalWave = styled.path`
  fill: rgba(32, 173, 117, 0.48);
  stroke: #159367;
  stroke-width: 1.25;
  vector-effect: non-scaling-stroke;
  stroke-linecap: round;
  stroke-linejoin: round;
`

const UserWave = styled.path`
  fill: rgba(239, 61, 100, 0.42);
  stroke: #dc3157;
  stroke-width: 1.25;
  vector-effect: non-scaling-stroke;
  stroke-linecap: round;
  stroke-linejoin: round;
`
