import {
  WORD_RECORDING_ALWAYS_PASS_WORDS,
  WORD_RECORDING_SPEECH_MATCH_THRESHOLD,
} from '@src/constants/study/word-practice/wordRecordingExceptions'
import {
  getTextSimilarity,
  normalizeSpeechText,
} from '@utils/speechTextSimilarity'

export { getTextSimilarity, normalizeSpeechText }

function getTranscriptCandidates(transcript: string): string[] {
  const normalizedTranscript = normalizeSpeechText(transcript)
  if (!normalizedTranscript) return []
  return [
    normalizedTranscript,
    ...normalizedTranscript.split(' ').filter(Boolean),
  ]
}

export function getBestSpeechSimilarity(
  transcript: string,
  target: string,
): number {
  const normalizedTarget = normalizeSpeechText(target)
  if (!normalizedTarget) return 0
  const candidates = getTranscriptCandidates(transcript)
  if (candidates.length === 0) return 0
  return Math.max(
    ...candidates.map((candidate) =>
      getTextSimilarity(candidate, normalizedTarget),
    ),
  )
}

export function isWordRecordingAlwaysPass(targetWord: string): boolean {
  return WORD_RECORDING_ALWAYS_PASS_WORDS.has(normalizeSpeechText(targetWord))
}

export function isWordRecordingMatch(
  transcript: string,
  targetWord: string,
): boolean {
  if (isWordRecordingAlwaysPass(targetWord)) return true
  return (
    getBestSpeechSimilarity(transcript, targetWord) >=
    WORD_RECORDING_SPEECH_MATCH_THRESHOLD
  )
}
