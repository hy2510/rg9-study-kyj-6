import { useCallback, useEffect, useRef, useState } from 'react'

import { transcribeSpeakRecordingLocally } from '@services/localSpeakTranscription'
import {
  getTextSimilarity,
  normalizeSpeechText,
} from '@utils/speechTextSimilarity'

export type RecordingResult =
  | 'correct'
  | 'incorrect'
  | 'unsupported'
  | 'microphone-unavailable'
  | 'error'

const FALLBACK_RECORDING_MS = 2000
const MIN_RECORDING_MS = 1500
const SPEECH_MATCH_THRESHOLD = 0.2

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

function getBestSpeechSimilarity(transcript: string, word: string): number {
  const normalizedTranscript = normalizeSpeechText(transcript)
  const normalizedWord = normalizeSpeechText(word)
  if (!normalizedTranscript || !normalizedWord) return 0

  const candidates = [normalizedTranscript, ...normalizedTranscript.split(' ')]
  return Math.max(
    ...candidates.map((candidate) =>
      getTextSimilarity(candidate, normalizedWord),
    ),
  )
}

function isSpeechMatch(transcript: string, word: string): boolean {
  return getBestSpeechSimilarity(transcript, word) >= SPEECH_MATCH_THRESHOLD
}

type UseVocaRecordingAnalysisParams = {
  targetWord: string
  /**
   * 문제 원음 URL. 지정 시 원음 길이를 미리 로드해 녹음 상한 시간을 동적으로 계산한다.
   * 미지정 / 로드 실패 시 기존 고정 상한(MAX_RECORDING_MS) 을 사용한다.
   */
  targetSoundUrl?: string
  pauseBookAudio: () => void
}

export function useVocaRecordingAnalysis({
  targetWord,
  targetSoundUrl,
  pauseBookAudio,
}: UseVocaRecordingAnalysisParams) {
  const [isRecordingMode, setIsRecordingMode] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [recordingResult, setRecordingResult] = useState<RecordingResult>()
  const [recognizedText, setRecognizedText] = useState('')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const recordingSessionRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const maxRecordingMsRef = useRef<number>(FALLBACK_RECORDING_MS)

  const releaseActiveStream = useCallback(() => {
    const stream = mediaStreamRef.current
    mediaStreamRef.current = null
    if (!stream) return
    stream.getAudioTracks().forEach((track) => track.stop())
  }, [])

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

    // 녹음 세션의 마이크 트랙을 즉시 해제해
    // iOS AVAudioSession 을 PlayAndRecord → Playback 으로 복귀시킨다.
    releaseActiveStream()

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
      setIsRecordingMode(false)
      setRecordingResult('unsupported')
      return
    }

    resetRecordingAnalysis()
    pauseBookAudio()

    // 짧은 단어 녹음이라 UI 즉시반응보다 "실제 녹음 시작 시점" 과
    // UI 전환 동기화가 더 중요하다. (Word Preview 와 동일한 패턴)
    const sessionId = ++recordingSessionRef.current

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      if (sessionId !== recordingSessionRef.current) return
      setRecordingResult('microphone-unavailable')
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
      setRecordingResult('error')
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
      // iOS AVAudioSession 을 PlayAndRecord → Playback 으로 복귀시킨다.
      stream.getAudioTracks().forEach((track) => track.stop())
      if (mediaStreamRef.current === stream) mediaStreamRef.current = null

      if (sessionId !== recordingSessionRef.current) return
      setIsRecordingMode(false)

      if (chunks.length === 0) {
        setRecordingResult('error')
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
          setRecognizedText(trimmed)
          setRecordingResult(
            isSpeechMatch(trimmed, targetWord) ? 'correct' : 'incorrect',
          )
        })
        .catch(() => {
          if (sessionId !== recordingSessionRef.current) return
          setRecordingResult('error')
        })
        .finally(() => {
          if (sessionId === recordingSessionRef.current) {
            setIsAnalyzing(false)
          }
        })
    }

    try {
      recorder.start()
    } catch {
      stream.getAudioTracks().forEach((track) => track.stop())
      if (mediaStreamRef.current === stream) mediaStreamRef.current = null
      mediaRecorderRef.current = null
      if (sessionId !== recordingSessionRef.current) return
      setRecordingResult('error')
      return
    }

    // 실제 recorder.start() 가 성공한 직후에 녹음 UI 로 전환해
    // 사용자의 발화 시작 시점과 녹음 시작 시점을 일치시킨다.
    setIsRecordingMode(true)

    timerRef.current = setTimeout(() => {
      timerRef.current = null
      if (recorder.state !== 'inactive') recorder.stop()
    }, maxRecordingMsRef.current)
  }, [pauseBookAudio, resetRecordingAnalysis, targetWord])

  useEffect(() => resetRecordingAnalysis, [resetRecordingAnalysis])

  return {
    isRecordingMode,
    isAnalyzing,
    recognizedText,
    recordingResult,
    resetRecordingAnalysis,
    startRecordingAnalysis,
  }
}
