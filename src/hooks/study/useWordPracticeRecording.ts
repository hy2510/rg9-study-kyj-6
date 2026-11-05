import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { transcribeSpeakRecordingLocally } from '@services/localSpeakTranscription'
import { isWordRecordingMatch } from '@utils/evaluateWordRecording'

export type WordPracticeRecordingResult =
  | 'correct'
  | 'incorrect'
  | 'no_microphone'
  | 'error'

const FALLBACK_RECORDING_MS = 2000
const MIN_RECORDING_MS = 1500

const soundDurationCache = new Map<string, number>()

/**
 * 원음 duration(ms) 기반으로 녹음 상한 시간을 계산한다.
 * 원음 길이에 배수(5초 이상 1.4배, 미만 1.2배)를 곱해 산출하며,
 * 하한(1.5초)만 적용해 극단적으로 짧은 녹음 시간을 방지한다.
 */
function computeMaxRecordingMs(soundDurationMs: number): number {
  if (!Number.isFinite(soundDurationMs) || soundDurationMs <= 0) {
    return FALLBACK_RECORDING_MS
  }
  const multiplier = soundDurationMs >= 5000 ? 1.4 : 1.2
  return Math.max(MIN_RECORDING_MS, soundDurationMs * multiplier)
}

type UseWordPracticeRecordingParams = {
  targetWord: string
  /**
   * 문제 원음 URL. 지정 시 원음 길이를 미리 로드해 녹음 상한 시간을 동적으로 계산한다.
   * 미지정 / 로드 실패 시 기본 상한(MAX_RECORDING_MS) 을 사용한다.
   */
  targetSoundUrl?: string
  onResult?: (result: WordPracticeRecordingResult) => void
}

/**
 * Word Practice 녹음/채점 훅.
 *
 * 마이크 라이프사이클은 Speak(`useSpeakRecordingAnalysis`) 와 동일하다:
 *   - 녹음 버튼 클릭 시점에 `getUserMedia` 직접 호출 (공유 스트림 없음)
 *   - 녹음 종료 시 해당 세션의 트랙만 `track.stop()` 으로 즉시 해제
 *     → iOS AVAudioSession 을 PlayAndRecord → Playback 으로 복귀시켜
 *       정/오답 피드백 사운드가 미디어 세션으로 정상 재생되도록 보장한다.
 * UI 체감상 "녹음 버튼 클릭 즉시 녹음 모드" 로 전환되도록 상태를 먼저
 * 세팅한 뒤 백그라운드에서 getUserMedia / MediaRecorder.start 를 진행한다.
 */
export function useWordPracticeRecording({
  targetWord,
  targetSoundUrl,
  onResult,
}: UseWordPracticeRecordingParams) {
  const [isRecordingMode, setIsRecordingMode] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [recordingResult, setRecordingResult] =
    useState<WordPracticeRecordingResult>()
  const [recognizedText, setRecognizedText] = useState('')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const recordingSessionRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const maxRecordingMsRef = useRef<number>(FALLBACK_RECORDING_MS)
  const hasReportedResultRef = useRef(false)
  const onResultRef = useRef(onResult)

  useLayoutEffect(() => {
    onResultRef.current = onResult
  })

  useEffect(() => {
    if (!targetSoundUrl) {
      maxRecordingMsRef.current = FALLBACK_RECORDING_MS
      return
    }

    const cached = soundDurationCache.get(targetSoundUrl)
    if (cached !== undefined) {
      maxRecordingMsRef.current = computeMaxRecordingMs(cached)
      return
    }

    let cancelled = false
    const probe = new Audio()
    probe.preload = 'metadata'

    const cleanup = () => {
      probe.removeEventListener('loadedmetadata', handleLoaded)
      probe.removeEventListener('error', handleError)
      probe.src = ''
    }

    function handleLoaded() {
      if (cancelled) return
      const durationMs = probe.duration * 1000
      if (Number.isFinite(durationMs) && durationMs > 0) {
        soundDurationCache.set(targetSoundUrl as string, durationMs)
        maxRecordingMsRef.current = computeMaxRecordingMs(durationMs)
      } else {
        maxRecordingMsRef.current = FALLBACK_RECORDING_MS
      }
      cleanup()
    }

    function handleError() {
      if (cancelled) return
      maxRecordingMsRef.current = FALLBACK_RECORDING_MS
      cleanup()
    }

    probe.addEventListener('loadedmetadata', handleLoaded, { once: true })
    probe.addEventListener('error', handleError, { once: true })
    probe.src = targetSoundUrl

    return () => {
      cancelled = true
      cleanup()
    }
  }, [targetSoundUrl])

  const reportResult = useCallback(
    (result: WordPracticeRecordingResult, transcript = '') => {
      if (hasReportedResultRef.current) return
      hasReportedResultRef.current = true
      setIsRecordingMode(false)
      setIsAnalyzing(false)
      setRecordingResult(result)
      setRecognizedText(transcript)
      onResultRef.current?.(result)
    },
    [],
  )

  const releaseActiveStream = useCallback(() => {
    const stream = mediaStreamRef.current
    mediaStreamRef.current = null
    if (!stream) return
    stream.getAudioTracks().forEach((track) => track.stop())
  }, [])

  const resetRecordingAnalysis = useCallback(() => {
    recordingSessionRef.current += 1

    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    const recorder = mediaRecorderRef.current
    mediaRecorderRef.current = null
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop()
    }

    releaseActiveStream()

    hasReportedResultRef.current = false
    setIsRecordingMode(false)
    setIsAnalyzing(false)
    setRecordingResult(undefined)
    setRecognizedText('')
  }, [releaseActiveStream])

  const startRecordingAnalysis = useCallback(async () => {
    if (
      typeof MediaRecorder === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      reportResult('error')
      return
    }

    resetRecordingAnalysis()

    // Word Practice 는 짧은 단어(≤4초) 녹음이라 UI 즉시반응보다
    // "실제 녹음 시작 시점" 과 UI 전환 동기화가 더 중요하다.
    // (Speak 처럼 getUserMedia 전에 setIsRecordingMode(true) 를 하면 사용자가
    //  UI 를 보고 먼저 발화 → 초반 음절 유실 → 전사 매치 실패 → 통과 불가)
    const sessionId = ++recordingSessionRef.current
    hasReportedResultRef.current = false

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      if (sessionId !== recordingSessionRef.current) return
      reportResult('no_microphone')
      return
    }

    // 세션이 바뀌었다면(reset/언마운트) 획득한 스트림을 즉시 해제
    if (sessionId !== recordingSessionRef.current) {
      stream.getAudioTracks().forEach((track) => track.stop())
      return
    }

    const preferredMimeType = [
      'audio/webm;codecs=opus',
      'audio/ogg;codecs=opus',
      'audio/webm',
    ].find((type) => MediaRecorder.isTypeSupported(type))

    let recorder: MediaRecorder
    try {
      recorder = new MediaRecorder(
        stream,
        preferredMimeType ? { mimeType: preferredMimeType } : undefined,
      )
    } catch {
      stream.getAudioTracks().forEach((track) => track.stop())
      if (sessionId !== recordingSessionRef.current) return
      reportResult('error')
      return
    }

    mediaRecorderRef.current = recorder
    mediaStreamRef.current = stream

    const chunks: Blob[] = []
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data)
    }

    recorder.onstop = () => {
      // 녹음 종료 시점에 해당 세션의 마이크 트랙을 즉시 해제해
      // iOS AVAudioSession 을 PlayAndRecord → Playback 으로 복귀시킨다. (Speak 패턴)
      stream.getAudioTracks().forEach((track) => track.stop())
      if (mediaStreamRef.current === stream) mediaStreamRef.current = null

      if (sessionId !== recordingSessionRef.current) return
      setIsRecordingMode(false)

      if (chunks.length === 0) {
        reportResult('error')
        return
      }

      const blob = new Blob(chunks, {
        type: recorder.mimeType || chunks[0]?.type || 'audio/webm',
      })

      setIsAnalyzing(true)
      void transcribeSpeakRecordingLocally(blob)
        .then((transcript) => {
          if (sessionId !== recordingSessionRef.current) return
          const trimmed = transcript.trim()
          reportResult(
            isWordRecordingMatch(trimmed, targetWord) ? 'correct' : 'incorrect',
            trimmed,
          )
        })
        .catch(() => {
          if (sessionId !== recordingSessionRef.current) return
          reportResult('error')
        })
    }

    try {
      recorder.start()
    } catch {
      stream.getAudioTracks().forEach((track) => track.stop())
      if (mediaStreamRef.current === stream) mediaStreamRef.current = null
      mediaRecorderRef.current = null
      if (sessionId !== recordingSessionRef.current) return
      reportResult('error')
      return
    }

    // 실제 recorder.start() 가 성공한 직후에 녹음 UI 로 전환해
    // 사용자의 발화 시작 시점과 녹음 시작 시점을 일치시킨다.
    setIsRecordingMode(true)

    timerRef.current = setTimeout(() => {
      timerRef.current = null
      if (recorder.state !== 'inactive') recorder.stop()
    }, maxRecordingMsRef.current)
  }, [reportResult, resetRecordingAnalysis, targetWord])

  useEffect(() => {
    return () => {
      resetRecordingAnalysis()
    }
  }, [resetRecordingAnalysis])

  return {
    isRecordingMode,
    isAnalyzing,
    recognizedText,
    recordingResult,
    resetRecordingAnalysis,
    startRecordingAnalysis,
  }
}
