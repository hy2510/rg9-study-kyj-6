import { ViewType } from '@interfaces/common/ViewType'
import type { StoryReadingProfile } from '@src/constants/story/storyReadingProfile'

// eBook Story
interface StoryProps {
  bookLevel: string
  studyId: string
  studentHistoryId: string
  isEbAnotherSizeYn: boolean
  isMovieShow: boolean
  storyData: PageProps[]
  toggleMovieShow: (isShow: boolean) => void
  isReadingComplete: boolean
  changeReadingComplete: () => Promise<void>
  isVisible?: boolean
  onRegisterPause?: (pauseFn: () => void) => void
  /**
   * 외부에서 책 오디오를 완전 정지(stop)할 수 있도록 등록.
   * pause 와 달리 `player.src` 까지 비우므로, 이후 어떤 트리거(예: canplaythrough)에도
   * 자동 재생이 다시 시작되지 않는다. Story → Study 전환 등 잔류 재생을 막아야 하는 곳에서 사용.
   */
  onRegisterStop?: (stopFn: () => void) => void
  /** 현재 스프레드에 보이는 책 페이지(Page) 중 최댓값 — 양면일 때 오른쪽까지 반영해 헤더 진행률에 사용 */
  onPageNumberChange?: (maxVisibleBookPage: number) => void
  /** 헤더 등에서 자동 넘김 제어 — `useStoryAudioPC`의 `changeAutoNextPage` 등록 */
  onRegisterChangeAutoNextPage?: (change: (next: boolean) => void) => void
  /** `useStoryAudioPC`의 AutoNext 상태 — 헤더 등과 동기화 */
  onAutoNextChange?: (isAutoNext: boolean) => void
  /** 헤더 배속 표시용 — `playbackRate` 변경 시 호출 */
  onPlaybackRateChange?: (rate: number) => void
  /** 헤더에서 `changePlaySpeed` 호출 — `useStoryAudioPC`와 동기화 */
  onRegisterChangePlaybackRate?: (setRate: (rate: number) => void) => void
  /** Basic / NoAudio / NoText / NoHighlight — `getStoryReadingProfileFlags`와 연동 */
  readingProfile: StoryReadingProfile
  /**
   * 서버 `bookInfo.HighlightDataYn` — 도서에 하이라이트 데이터가 있는지 여부.
   * false 이면 프로필과 무관하게 절대 하이라이트를 렌더하지 않는다.
   */
  hasHighlightData?: boolean
  /** 마지막 페이지에서 다음 화살표를 눌렀을 때 호출 */
  onFinalNext?: () => void
  /** 모든 페이지 이미지 프리로드 완료 시 호출 */
  onImagesLoaded?: () => void
  /**
   * `speak`: 스프레드 자동 넘김 없음·페이지 화살표 숨김(Speak 뷰). 미지정이면 일반 Story.
   */
  bookInteractionMode?: 'default' | 'speak'
}
interface StoryMobileProps {
  isRatingShow: boolean
  isMovieShow: boolean
  storyData: PageProps[]
  changeCurrentView: (view: ViewType) => void
  toggleMovieShow: (isShow: boolean) => void
  changeReadingComplete: (
    studyId: string,
    studentHistoryId: string,
  ) => Promise<void>
}

// 페이지 정보
type PageState = '' | 'play' | 'left' | 'right'
type PageProps = {
  BookId: string
  Page: number
  Css: string
  Contents: string
  FontColor: string
  ImagePath: string
  Sequence: number
  StartTime: number
  EndTime: number
  SoundPath: string
  SoundPath2: string
  MarginTop: number
  MarginLeft: number
}

type StoryPageProps = {
  isTextShow: boolean
  pageSeq: PageSequenceProps
  pageNumber: number
  storyData: PageProps[]
  currentTime: number
  readCnt: number
  isHighlight: boolean
  clickSentence: (page: number, sequence: number) => void
}

type PageSequenceProps = {
  playPage: number
  sequence: number
}
// 페이지 정보 end

type StoryMenuItemProps = {
  name: string
  selected: '' | 'on'
}

type StoryMenuSpeedItemProps = {
  rate: number
  selected: '' | 'on'
}

// 오디오 상태
type PlayState = '' | 'play' | 'stop' | 'pause' | 'resume'

// movie book
type MovieBookPCProps = {
  isRatingShow: boolean
  url: string
  changeCurrentView: (view: ViewType) => void
}

type MovieBookMobileProps = {
  isRatingShow: boolean
  url: string
  changeCurrentView: (view: ViewType) => void
}

export type {
  MovieBookMobileProps,
  MovieBookPCProps,
  PageProps,
  PageSequenceProps,
  PageState,
  PlayState,
  StoryMenuItemProps,
  StoryMenuSpeedItemProps,
  StoryMobileProps,
  StoryPageProps,
  StoryProps,
}

export type { StoryReadingProfile } from '@src/constants/story/storyReadingProfile'
