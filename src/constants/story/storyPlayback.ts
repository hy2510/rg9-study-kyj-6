/** Story 책 음원 배속 — `useStoryAudioPC` / 헤더 UI와 공유 */
export const STORY_PLAYBACK_RATES = [0.75, 1, 1.25] as const

export type StoryPlaybackRate = (typeof STORY_PLAYBACK_RATES)[number]

export function findStoryPlaybackRateIndex(rate: number): number {
  const i = STORY_PLAYBACK_RATES.findIndex((r) => Math.abs(r - rate) < 0.001)
  return i >= 0 ? i : 1
}

export function formatStoryPlaybackRateLabel(rate: number): string {
  if (Math.abs(rate - 1) < 0.001) return '1x'
  return `${rate}x`
}
