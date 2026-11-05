import type {
  ISpeakRecord,
  LocalSpeakRecord,
} from '@interfaces/study/speak/ISpeak'

/**
 * `saveSpeakResult` 요청/응답에서 사용하는 wordsJson 문자열의 스키마.
 * - `isSkipped` 는 신규 필드. 「건너뛰기」로 저장된 record 를 명시적으로 표시하기 위해 도입.
 */
type SpeakWordsPayload = {
  transcript?: string
  matchedWordIndexes?: number[]
  matchedCount?: number
  totalCount?: number
  isSkipped?: boolean
}

function parseWordsJson(
  wordsJson: string | null | undefined,
): SpeakWordsPayload | undefined {
  if (!wordsJson) return undefined
  try {
    return JSON.parse(wordsJson) as SpeakWordsPayload
  } catch {
    return undefined
  }
}

/**
 * `wordsJson` 문자열을 파싱해 `matchedWordIndexes` (0-based) 를 추출한다.
 * 형식이 손상됐거나 값이 비어있으면 `undefined` 를 반환.
 */
export function extractMatchedWordIndexes(
  wordsJson: string | null | undefined,
): number[] | undefined {
  const parsed = parseWordsJson(wordsJson)
  if (!parsed || !Array.isArray(parsed.matchedWordIndexes)) return undefined
  return parsed.matchedWordIndexes.filter(
    (n): n is number => typeof n === 'number' && Number.isFinite(n),
  )
}

/**
 * `wordsJson` 이 「건너뛰기」로 저장된 것인지 판별한다.
 *
 * 판정 순서:
 * 1. `isSkipped` 플래그가 명시적으로 true → Skip
 * 2. (하위호환 휴리스틱) `transcript` 가 비어있고 `matchedCount` 가 0 → Skip 으로 간주
 *    - 실제로는 「녹음했지만 인식 실패」와 구별 불가하지만, 신규 저장부터는 플래그가 붙으므로
 *      점진적으로 정확해진다.
 */
export function extractIsSkipped(
  wordsJson: string | null | undefined,
): boolean {
  const parsed = parseWordsJson(wordsJson)
  if (!parsed) return false
  if (parsed.isSkipped === true) return true
  const transcript = (parsed.transcript ?? '').trim()
  const matched = Array.isArray(parsed.matchedWordIndexes)
    ? parsed.matchedWordIndexes.length
    : (parsed.matchedCount ?? 0)
  return transcript === '' && matched === 0
}

/**
 * 서버가 돌려준 `ISpeakRecord` 를 클라이언트 확장 타입으로 변환한다.
 * `WordsJson` 이 있으면 파싱해 `matchedWordIndexes` / `isSkipped` 를 채운다.
 */
export function toLocalSpeakRecord(record: ISpeakRecord): LocalSpeakRecord {
  return {
    ...record,
    matchedWordIndexes: extractMatchedWordIndexes(record.WordsJson),
    isSkipped: extractIsSkipped(record.WordsJson),
  }
}
