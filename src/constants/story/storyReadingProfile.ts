/**
 * Story(EB) 읽기 프로필 — 기획 정의:
 *
 * - **basic**: 음원·문장·하이라이트 모두 활성(일반 재생)
 * - **noAudio**: 음원은 재생되지만 **볼륨 0**(무음)
 * - **noText**: **문장(텍스트) 비표시** — 텍스트가 없으므로 **하이라이트도 비표시**
 * - **noHighlight**: 음원 재생 중에도 **하이라이트 비표시**
 */
export type StoryReadingProfile = 'basic' | 'noAudio' | 'noText' | 'noHighlight'

/** 말풍선·설정 UI 나열 순서 */
export const STORY_READING_PROFILES_ORDER: StoryReadingProfile[] = [
  'basic',
  'noHighlight',
  'noText',
  'noAudio',
]

export const STORY_READING_PROFILE_STORAGE_KEY = 'storyReadingProfile'

const PROFILE_LABELS: Record<StoryReadingProfile, string> = {
  basic: 'Focus · On',
  noAudio: 'Text Only',
  noText: 'Audio Only',
  noHighlight: 'Focus · Off',
}

export function getStoryReadingProfileLabel(
  profile: StoryReadingProfile,
): string {
  return PROFILE_LABELS[profile]
}

export function parseStoredStoryReadingProfile(
  raw: string | null,
): StoryReadingProfile {
  if (
    raw === 'basic' ||
    raw === 'noAudio' ||
    raw === 'noText' ||
    raw === 'noHighlight'
  ) {
    return raw
  }
  return 'basic'
}

export type StoryReadingProfileFlags = {
  /** true: 재생은 하되 `HTMLAudioElement` 볼륨 0(또는 muted) */
  audioMuted: boolean
  /** false: 문장 레이어 비표시 */
  showText: boolean
  /** false: 재생 중에도 하이라이트 없음 */
  showHighlightWhilePlaying: boolean
}

export function getStoryReadingProfileFlags(
  profile: StoryReadingProfile,
): StoryReadingProfileFlags {
  switch (profile) {
    case 'basic':
      return {
        audioMuted: false,
        showText: true,
        showHighlightWhilePlaying: true,
      }
    case 'noAudio':
      return {
        audioMuted: true,
        showText: true,
        showHighlightWhilePlaying: false,
      }
    case 'noText':
      return {
        audioMuted: false,
        showText: false,
        showHighlightWhilePlaying: false,
      }
    case 'noHighlight':
      return {
        audioMuted: false,
        showText: true,
        showHighlightWhilePlaying: false,
      }
  }
}
