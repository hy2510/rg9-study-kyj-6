import { useEffect, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { IconArrowRightWhite } from '@components/atoms/common/icons/IconArrowRightWhite'
import { IconRec } from '@components/atoms/common/icons/IconRec'
import IntroCoverBook from '@components/molecules/common/intro/IntroCoverBook'
import {
  IntroBackdrop,
  IntroColumn,
  IntroStartButton,
  IntroTitle,
} from '@components/molecules/common/intro/IntroLayout'
import { warmupTranscriptionWorker } from '@services/localSpeakTranscription'

type SpeakIntroPanelProps = {
  coverSrc: string
  onStart: () => void
  onClose: () => void
}

export default function SpeakIntroPanel({
  coverSrc,
  onStart,
  onClose,
}: SpeakIntroPanelProps) {
  const { t } = useTranslation()
  const [microphoneStatus, setMicrophoneStatus] = useState<
    'checking' | 'connected' | 'disconnected'
  >('checking')
  const [isModelReady, setIsModelReady] = useState(false)
  const [waitingForModel, setWaitingForModel] = useState(false)
  const warmupRef = useRef<Promise<void>>()

  useEffect(() => {
    warmupRef.current = warmupTranscriptionWorker()
    void warmupRef.current.then(() => setIsModelReady(true))
  }, [])

  useEffect(() => {
    if (isModelReady && waitingForModel) {
      onStart()
    }
  }, [isModelReady, waitingForModel])

  useEffect(() => {
    let cancelled = false

    // 녹음 권한은 녹음 버튼을 처음 눌렀을 때 요청한다 (DDR 패턴).
    // 여기서는 "녹음 지원 환경" 여부만 체크해 안내 메시지를 노출한다.
    const detectRecordingSupport = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        if (!cancelled) setMicrophoneStatus('disconnected')
        return
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        if (cancelled) return
        const hasAudioInput = devices.some(
          (device) => device.kind === 'audioinput',
        )
        setMicrophoneStatus(hasAudioInput ? 'connected' : 'disconnected')
      } catch {
        if (!cancelled) setMicrophoneStatus('disconnected')
      }
    }

    const handleDeviceChange = () => {
      void detectRecordingSupport()
    }

    void detectRecordingSupport()
    navigator.mediaDevices?.addEventListener('devicechange', handleDeviceChange)

    return () => {
      cancelled = true
      navigator.mediaDevices?.removeEventListener(
        'devicechange',
        handleDeviceChange,
      )
    }
  }, [])

  const microphoneMessage =
    microphoneStatus === 'checking'
      ? t('intro.checkingMic')
      : microphoneStatus === 'connected'
        ? t('intro.micConnected')
        : t('intro.checkMic')

  return (
    <IntroBackdrop
      role='dialog'
      aria-modal='true'
      aria-labelledby='intro-title'
    >
      <IntroColumn>
        <IntroCoverBook coverSrc={coverSrc} />
        <div>
          <IntroTitle id='intro-title'>{t('intro.readyToSpeak')}</IntroTitle>
          <MicHint $connected={microphoneStatus === 'connected'}>
            <MicStatusDot aria-hidden />
            {microphoneMessage}
          </MicHint>
        </div>
        {/* <SpeakStartButton type='button' onClick={onStart}>
          <SpeakStartLeft>
            <IconRec width={36} height={36} />
            {t('intro.letsSpeak')}
          </SpeakStartLeft>
          <IconArrowRightWhite width={18} height={18} />
        </SpeakStartButton> */}
        <IntroStartButton
          type='button'
          onClick={() => {
            if (isModelReady) {
              onStart()
            } else {
              setWaitingForModel(true)
            }
          }}
        >
          Start
        </IntroStartButton>
        {waitingForModel && !isModelReady && (
          <ModelLoadingOverlay>
            <ModelLoadingSpinner />
            <ModelLoadingText>{t('common.preparingStudy')}</ModelLoadingText>
          </ModelLoadingOverlay>
        )}
        <CloseLink type='button' onClick={onClose}>
          Not Now
        </CloseLink>
      </IntroColumn>
    </IntroBackdrop>
  )
}

const MicHint = styled.p<{ $connected: boolean }>`
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-family: 'Rg-B', sans-serif;
  font-size: 0.9em;
  color: ${({ $connected }) =>
    $connected ? '#9ff0c8' : 'rgba(255, 255, 255, 0.8)'};
`

const MicStatusDot = styled.span`
  width: 7px;
  height: 7px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: currentColor;
`

const SpeakStartLeft = styled.span`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
`

const SpeakStartButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  max-width: 400px;
  height: 60px;
  border: none;
  border-radius: 20px;
  margin-top: 4px;
  padding: 0 20px;
  background: #354257;
  color: #fff;
  cursor: pointer;
  font-family: 'Rg-B', sans-serif;
  font-size: 1.25em;
  font-weight: 600;
  box-shadow: 0 3px 0 0 #1e2a38;
  transform: translateY(0);
  transition: all 0.05s ease;

  &:active {
    transform: translateY(3px);
    box-shadow: none;
  }
`

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

const ModelLoadingOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  z-index: 999;
`

const ModelLoadingSpinner = styled.div`
  width: 44px;
  height: 44px;
  border: 4px solid rgba(255, 255, 255, 0.25);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`

const ModelLoadingText = styled.p`
  margin: 0;
  font-family: 'Rg-B', sans-serif;
  font-size: 1em;
  color: rgba(255, 255, 255, 0.85);
`
