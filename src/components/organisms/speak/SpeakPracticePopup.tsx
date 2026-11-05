import { useLayoutEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'
import styled, { css, keyframes } from 'styled-components'

import { IconArrowRightWhite } from '@components/atoms/common/icons/IconArrowRightWhite'
import { IconMicWhite } from '@components/atoms/common/icons/IconMicWhite'
import TextBox from '@components/atoms/common/TextBox'
import PopupLayout from '@components/molecules/common/PopupLayout'
import SpeakWaveformComparison from '@components/organisms/speak/SpeakWaveformComparison'
import useSpeakFeedbackSound from '@src/hooks/speak/useSpeakFeedbackSound'
import useSpeakUserAudio from '@src/hooks/speak/useSpeakUserAudio'
import { useSpeakRecordingAnalysis } from '@src/hooks/story/useSpeakRecordingAnalysis'
import { SpeakPageProps } from '@src/interfaces/study/speak/ISpeak'
import { getSentenceDisplayTokens } from '@src/utils/speak/sentenceTokens'

type NextData = {
  matchedWordCount: number
  totalWordCount: number
  recognizedText: string
  matchedWordIndexes: number[]
  userRecordingBlob?: Blob
}

type SpeakPracticePopupProps = {
  speakData: SpeakPageProps[]
  quizIndex: number
  /** 닫기(Speak 종료 → Story) */
  onClose: () => void
  isPlaying: boolean
  audioDuration: number
  originalPlaybackProgress: number
  onPlaySentence: () => void
  /** 팝업을 닫고 책 화면에서 원음을 재생한 뒤 다시 팝업을 연다. */
  onReplaySentenceFromBook: () => void
  /**
   * 녹음 시작 직전 동기 호출. iOS 에서 AudioContext 세션을 suspend 해
   * SpeechRecognition 이 마이크 세션을 정상 획득하도록 한다.
   */
  onBeforeRecord?: () => void
  isSaving: boolean
  onNext: (data: NextData) => Promise<void>
  onSkip: () => Promise<void>
}

export default function SpeakPracticePopup({
  speakData,
  quizIndex,
  onClose,
  isPlaying,
  audioDuration,
  originalPlaybackProgress,
  onPlaySentence,
  onReplaySentenceFromBook,
  onBeforeRecord,
  isSaving,
  onNext,
}: SpeakPracticePopupProps) {
  const { t } = useTranslation()
  const targetSentence = speakData[quizIndex]?.Sentence ?? ''
  const [playbackTrack, setPlaybackTrack] = useState<'original' | 'user'>()
  const [isWaveformReady, setIsWaveformReady] = useState(false)

  const {
    isRecordingMode,
    isAnalyzing,
    microphoneError,
    matchedWordIndexes,
    recognizedText,
    recordingResult,
    recordingProgress,
    userRecordingUrl,
    userRecordingBlob,
    startRecordingAnalysis,
    resetRecordingAnalysis,
  } = useSpeakRecordingAnalysis({
    targetSentence,
    maxDurationMs: audioDuration * 1000,
  })

  /**
   * 유저 녹음 재생 — HTMLAudioElement 기반.
   * Web Audio API 로 재생하면 iOS 가 ambient 세션으로 유지해 볼륨 키가 미디어 볼륨을
   * 조절하지 못하는 문제가 있어 HTMLAudioElement 로 통일했다. 훅 내부에서
   * WebM blob 의 duration=Infinity 는 seek-to-end hack 으로 보정한다.
   */
  const {
    isPlaying: isUserAudioPlaying,
    playbackProgress: userPlaybackProgress,
    play: playUserAudio,
    stop: stopUserAudio,
    suspend: suspendUserAudio,
  } = useSpeakUserAudio({
    blob: userRecordingBlob,
  })

  const totalWordCount = targetSentence
    .trim()
    .split(/\s+/)
    .filter(Boolean).length

  /**
   * quizIndex 변경 시 녹음/재생 관련 상태를 `paint 전` 동기 리셋.
   *
   * useEffect 로 하면 커밋 → paint → effect 순서로 실행되어, 새 quizIndex 로 render 된
   * 한 프레임 동안 이전 녹음의 Next 버튼이 활성 상태로 노출된다. 이 윈도우에 연타가 도달하면
   * 이전 recording blob 이 다음 문제에 재제출되는 버그가 발생한다 (SpeakContainer.handleNext
   * 의 클로저는 새 quizIndex 를 참조하기 때문).
   */
  useLayoutEffect(() => {
    stopUserAudio()
    setPlaybackTrack(undefined)
    setIsWaveformReady(false)
    resetRecordingAnalysis()
  }, [quizIndex])

  const { prepareFeedbackAudio } = useSpeakFeedbackSound(recordingResult)

  /**
   * 녹음 시작 전 오디오 세션 해제 → 즉시 SpeechRecognition 시작.
   * iOS user gesture chain 유지를 위해 동기적으로 호출한다.
   */
  const handleRecordClick = () => {
    stopUserAudio()
    suspendUserAudio()
    setPlaybackTrack(undefined)
    prepareFeedbackAudio()
    onBeforeRecord?.()
    void startRecordingAnalysis()
  }

  const handleOriginalAudioClick = () => {
    stopUserAudio()
    setPlaybackTrack('original')
    onPlaySentence()
  }

  const handleUserAudioClick = () => {
    if (!userRecordingBlob) return
    if (isUserAudioPlaying) {
      stopUserAudio()
      setPlaybackTrack(undefined)
      return
    }
    setPlaybackTrack('user')
    playUserAudio()
  }

  const isCorrect = recordingResult === 'correct'
  const isIncorrect = recordingResult === 'incorrect'
  const hasFinalResult = isCorrect || isIncorrect
  const matchedWordIndexSet = new Set(matchedWordIndexes)
  const sentenceDisplayTokens = getSentenceDisplayTokens(targetSentence)

  return (
    <PopupLayout onClose={onClose}>
      <MainContainer isCorrect={isCorrect} isIncorrect={isIncorrect}>
        {isRecordingMode ? (
          <StatusDot $status='recording' aria-hidden />
        ) : isCorrect ? (
          <StatusDot $status='learned' aria-hidden />
        ) : null}
        {isAnalyzing ? (
          <AnalyzingOverlay
            role='status'
            aria-label={t('study.vocabularyPractice.analyzing')}
          >
            <AnalyzingSpinner aria-hidden />
          </AnalyzingOverlay>
        ) : null}
        <SentenceReplayButton type='button' onClick={onReplaySentenceFromBook}>
          <OriginalSentence
            fontSize={1.75}
            fontWeight={600}
            color={isCorrect ? '#199261' : isIncorrect ? '#EF3D64' : 'primary'}
          >
            {sentenceDisplayTokens.map((token, tokenIndex) => {
              if (token.wordIndex === undefined) return token.text

              return (
                <SentenceWord
                  key={`${token.text}-${tokenIndex}`}
                  $matched={
                    hasFinalResult && matchedWordIndexSet.has(token.wordIndex)
                  }
                  $dimmed={
                    hasFinalResult && !matchedWordIndexSet.has(token.wordIndex)
                  }
                >
                  {token.text}
                </SentenceWord>
              )
            })}
          </OriginalSentence>
        </SentenceReplayButton>
        {speakData[quizIndex]?.SoundPath ? (
          <SpeakWaveformComparison
            originalAudioUrl={speakData[quizIndex].SoundPath}
            userAudioUrl={userRecordingUrl}
            isOriginalPlaying={isPlaying}
            isUserPlaying={isUserAudioPlaying}
            disabled={isRecordingMode || isAnalyzing || isSaving}
            onPlayOriginal={handleOriginalAudioClick}
            onPlayUser={handleUserAudioClick}
            playbackProgress={
              isRecordingMode
                ? recordingProgress
                : playbackTrack === 'original'
                  ? originalPlaybackProgress
                  : playbackTrack === 'user'
                    ? userPlaybackProgress
                    : 0
            }
            playbackColor={playbackTrack === 'user' ? 'red' : 'green'}
            onReadyChange={setIsWaveformReady}
          />
        ) : null}
        {microphoneError ? (
          <MicrophonePreparing role='alert' $error>
            <MicrophonePreparingDot $error aria-hidden />
            {t(`speak.microphoneError.${microphoneError}`)}
          </MicrophonePreparing>
        ) : null}
        <Actions>
          <div className='record-button-container'>
            <RecordButton
              type='button'
              $recording={isRecordingMode}
              $disabled={
                isPlaying ||
                !isWaveformReady ||
                isAnalyzing ||
                audioDuration === 0 ||
                isRecordingMode ||
                isSaving
              }
              disabled={
                isPlaying ||
                !isWaveformReady ||
                isAnalyzing ||
                audioDuration === 0 ||
                isRecordingMode ||
                isSaving
              }
              onClick={handleRecordClick}
            >
              <IconMicWhite width={24} height={24} />
            </RecordButton>
            {hasFinalResult ? (
              <NextButton
                type='button'
                $disabled={
                  isPlaying || isUserAudioPlaying || isRecordingMode || isSaving
                }
                disabled={
                  isPlaying || isUserAudioPlaying || isRecordingMode || isSaving
                }
                onClick={() =>
                  onNext({
                    matchedWordCount: matchedWordIndexes.length,
                    totalWordCount,
                    recognizedText,
                    matchedWordIndexes,
                    userRecordingBlob,
                  })
                }
              >
                <IconArrowRightWhite width={24} height={24} />
              </NextButton>
            ) : null}
          </div>
        </Actions>
      </MainContainer>
    </PopupLayout>
  )
}

const MainContainer = styled.div<{ isCorrect: boolean; isIncorrect: boolean }>`
  flex: 1;
  width: calc(100% - 40px);
  min-height: 0;
  height: calc(100% - 40px);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${({ isCorrect, isIncorrect }) =>
    isCorrect ? '#d3ffbc' : isIncorrect ? '#FDEDEF' : '#fff'};
  flex-direction: column;
  gap: 12px;
  position: relative;
  z-index: 1;

  > * {
    position: relative;
    z-index: 1;
  }

  &::before {
    content: '';
    position: absolute;
    top: -20px;
    left: -20px;
    width: calc(100% + 40px);
    height: calc(100% + 40px);
    background-color: ${({ isCorrect, isIncorrect }) =>
      isCorrect ? '#d3ffbc' : isIncorrect ? '#FDEDEF' : '#fff'};
    border-radius: 30px;
    pointer-events: none;
    z-index: 0;
  }
`

const SentenceWord = styled.span<{ $matched: boolean; $dimmed: boolean }>`
  display: inline-block;
  padding: 0 3px;
  border-radius: 8px;
  color: ${(p) => (p.$matched ? '#199261' : 'inherit')};
  background: ${(p) =>
    p.$matched ? 'rgba(211, 255, 188, 0.9)' : 'transparent'};
  opacity: ${(p) => (p.$dimmed ? 0.35 : 1)};
  transition:
    background 0.15s ease,
    color 0.15s ease,
    opacity 0.15s ease;
`

const OriginalSentence = styled(TextBox)`
  width: 100%;
  text-align: left;
`

const SentenceReplayButton = styled.button`
  width: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
`

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

const Actions = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  .record-button-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
`

const MicrophonePreparing = styled.div<{ $error: boolean }>`
  position: absolute;
  top: 16px;
  left: 16px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: ${(p) => (p.$error ? '#d82f52' : '#596579')};
  font-family: 'Rg-R', 'Chiron GoRound TC', sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
`

const MicrophonePreparingDot = styled.span<{ $error?: boolean }>`
  width: 9px;
  height: 9px;
  flex: 0 0 9px;
  border-radius: 50%;
  background: ${(p) => (p.$error ? '#d82f52' : '#12966b')};
  animation: ${(p) => (p.$error ? 'none' : recordingDotBlink)} 0.9s ease-in-out
    infinite;
`

const spinnerRotation = keyframes`
  to {
    transform: rotate(360deg);
  }
`

const AnalyzingOverlay = styled.div`
  position: absolute;
  inset: -20px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.62);
  pointer-events: all;
`

const AnalyzingSpinner = styled.span`
  width: 46px;
  height: 46px;
  border: 5px solid rgba(53, 66, 87, 0.18);
  border-top-color: #159367;
  border-radius: 50%;
  animation: ${spinnerRotation} 0.8s linear infinite;
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

const StatusDot = styled.span<{ $status: 'recording' | 'learned' }>`
  position: absolute;
  top: 16px;
  left: 16px;
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

const NextButton = styled.button<{ $disabled: boolean }>`
  position: relative;
  cursor: ${(p) => (p.$disabled ? 'not-allowed' : 'pointer')};
  opacity: ${(p) => (p.$disabled ? 0.45 : 1)};
  width: 50px;
  height: 50px;
  border-radius: 15px;
  border: 2px solid rgb(0, 0, 0, 0.2);
  padding: 0;
  background: #354257;

  &:active {
    transform: translateY(2px);
    border-bottom: none;
  }
`

const RecordButton = styled.button<{ $recording: boolean; $disabled: boolean }>`
  position: relative;
  cursor: ${(p) => (p.$disabled ? 'not-allowed' : 'pointer')};
  opacity: ${(p) => (p.$disabled ? 0.45 : 1)};
  width: 50px;
  height: 50px;
  border-radius: 15px;
  border: 2px solid ${(p) => (p.$recording ? '#ef3d64' : 'transparent')};
  padding: 0;
  background: #e82031;
  border-bottom: ${(p) =>
    p.$recording ? 'none' : '3px solid rgb(0, 0, 0, 0.2)'};
  display: flex;
  align-items: center;
  justify-content: center;
  transform: ${(p) => (p.$recording ? 'translateY(2px)' : 'translateY(0)')};
  overflow: ${(p) => (p.$recording ? 'visible' : 'hidden')};
  ${(p) =>
    p.$recording
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

  img {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }

  &:active {
    transform: translateY(2px);
    border-bottom: none;
  }
`
