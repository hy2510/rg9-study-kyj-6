import { type MouseEvent, type ReactNode, type TouchEvent } from 'react'

import { IconSoundPlay } from '@components/atoms/common/icons/IconSoundPlay'
import { IconSoundStop } from '@components/atoms/common/icons/IconSoundStop'
import BookEdgeTapRail from '@components/atoms/story/book/BookEdgeTapRail'
import BookStage from '@components/atoms/story/book/BookStage'
import BookSwipePane from '@components/atoms/story/book/BookSwipePane'
import PlayButtonTouch from '@components/atoms/story/book/PlayButtonTouch'
import { MOBILE_BOOK_EDGE_TAP_PX } from '@utils/story/storyPCHelpers'

type StoryBookTouchChromeProps = {
  children: ReactNode
  swipeHandlers: {
    onTouchStart: (e: TouchEvent<HTMLDivElement>) => void
    onTouchCancel: () => void
    onTouchEnd: (e: TouchEvent<HTMLDivElement>) => void
  }
  showLeftTap: boolean
  showRightTap: boolean
  onTapPrev: (e: MouseEvent<HTMLButtonElement>) => void
  onTapNext: (e: MouseEvent<HTMLButtonElement>) => void
  showPlayButton: boolean
  isPlaying: boolean
  onTogglePlay: (e: MouseEvent<HTMLButtonElement>) => void
}

/**
 * 모바일·태블릿 터치 레이아웃 책 chrome.
 * - 가운데 영역: 스와프 제스처 + 책 표시
 * - 양 끝: 작은 탭 영역으로 이전/다음 페이지
 * - 우하단 floating: 재생/일시정지 버튼
 */
export default function StoryBookTouchChrome({
  children,
  swipeHandlers,
  showLeftTap,
  showRightTap,
  onTapPrev,
  onTapNext,
  showPlayButton,
  isPlaying,
  onTogglePlay,
}: StoryBookTouchChromeProps) {
  return (
    <>
      <BookSwipePane
        onTouchStart={swipeHandlers.onTouchStart}
        onTouchCancel={swipeHandlers.onTouchCancel}
        onTouchEnd={swipeHandlers.onTouchEnd}
      >
        <BookStage>{children}</BookStage>
        {showLeftTap && (
          <BookEdgeTapRail
            type='button'
            $side='left'
            $widthPx={MOBILE_BOOK_EDGE_TAP_PX}
            onClick={onTapPrev}
            aria-label='이전 페이지'
          />
        )}
        {showRightTap && (
          <BookEdgeTapRail
            type='button'
            $side='right'
            $widthPx={MOBILE_BOOK_EDGE_TAP_PX}
            onClick={onTapNext}
            aria-label='다음 페이지'
          />
        )}
      </BookSwipePane>
      {showPlayButton && (
        <PlayButtonTouch
          type='button'
          onClick={onTogglePlay}
          aria-label={isPlaying ? '일시정지' : '재생'}
        >
          {isPlaying ? <IconSoundStop alt='' /> : <IconSoundPlay alt='' />}
        </PlayButtonTouch>
      )}
    </>
  )
}
