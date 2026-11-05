import { type Ref } from 'react'

import type { StoryReadingProfile } from '@constants/story/storyReadingProfile'
import { HeaderBaseProps } from '@interfaces/common/header/HeaderBaseProps'
import type { StoryVocaKeywordRow } from '@utils/story/flattenVocabularyPracticeRows'

/**
 * Story 화면 전용 헤더 props.
 */
export type HeaderStoryProps = HeaderBaseProps & {
  variant: 'story'
  progress?: number
  total?: number
  onVocaClick?: () => void
  onSpeakClick?: () => void
  onMovieClick?: () => void
  onReadAgainClick?: () => void
  vocaAnchorRef?: Ref<HTMLButtonElement>
  isAutoNext?: boolean
  onAutoNextToggle?: () => void
  readingProfile?: StoryReadingProfile
  profileAnchorRef?: Ref<HTMLButtonElement>
  isProfileBalloonOpen?: boolean
  onProfileBalloonToggle?: () => void
  playbackRate?: number
  speedAnchorRef?: Ref<HTMLButtonElement>
  isSpeedBalloonOpen?: boolean
  onSpeedBalloonToggle?: () => void
  /** 사이드 메뉴 Key Words — VocaPreviewPopup과 동일 API 기반 행 */
  storyVocaKeywordRows?: StoryVocaKeywordRow[]
  storyVocabularyPrintUrl?: string
  pauseBookAudio?: () => void
  /**
   * 사이드 메뉴의 "퀴즈 풀기" row 비활성화 여부.
   *
   * 별점(preference) 을 아직 제출하지 않은 학생(`isSubmitPreference === false`)은
   * 사이드 메뉴를 통해서는 학습으로 바로 넘어갈 수 없도록 한다. 별점 제출은
   * Story Complete 팝업의 "퀴즈 풀기" 버튼에서만 진행되며, 그 흐름을 통해서만
   * 학습으로 진입한다.
   */
  isGoQuizDisabled?: boolean
  /**
   * "퀴즈 풀기" 비활성화 시 얼럿에 노출할 i18n 메시지 키.
   * 미지정 시 기본값 `'story.quizRequiresFullReading'` 사용.
   */
  goQuizDisabledMessageKey?: string
}
