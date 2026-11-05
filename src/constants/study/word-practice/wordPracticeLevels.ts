export type WordPracticeLevelCode =
  | 'ka' | 'kb' | 'kc'
  | '1a' | '1b' | '1c'
  | '2a' | '2b' | '2c'
  | '3a' | '3b' | '3c'
  | '4a' | '4b' | '4c'
  | '5a' | '5b' | '5c'
  | '6a' | '6b' | '6c'

export type WordPracticeTrack = 'a' | 'b'

export const WORD_PRACTICE_A_LEVELS = [
  'ka', 'kb', 'kc', '1a', '1b', '1c',
] as const satisfies readonly WordPracticeLevelCode[]

export const WORD_PRACTICE_B_LEVELS = [
  '2a', '2b', '2c', '3a', '3b', '3c', '4a', '4b', '4c',
  '5a', '5b', '5c', '6a', '6b', '6c',
] as const satisfies readonly WordPracticeLevelCode[]

export const WORD_PRACTICE_LEVELS: WordPracticeLevelCode[] = [
  ...WORD_PRACTICE_A_LEVELS,
  ...WORD_PRACTICE_B_LEVELS,
]

export type WordPracticeLevelInfo = {
  code: WordPracticeLevelCode
  track: WordPracticeTrack
  label: string
}

export const WORD_PRACTICE_LEVEL_OPTIONS: WordPracticeLevelInfo[] =
  WORD_PRACTICE_LEVELS.map((code) => ({
    code,
    track: getWordPracticeTrack(code),
    label: code.toUpperCase(),
  }))

export function isWordPracticeLevelCode(value: string): value is WordPracticeLevelCode {
  return (WORD_PRACTICE_LEVELS as readonly string[]).includes(value)
}

export function getWordPracticeTrack(level: WordPracticeLevelCode): WordPracticeTrack {
  if ((WORD_PRACTICE_A_LEVELS as readonly string[]).includes(level)) return 'a'
  return 'b'
}

export function resolveWordPracticeLevel(level?: string | null): WordPracticeLevelCode {
  if (level && isWordPracticeLevelCode(level)) return level
  return 'ka'
}
