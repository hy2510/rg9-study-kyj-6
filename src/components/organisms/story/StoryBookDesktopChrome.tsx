import { type MouseEvent, type ReactNode } from 'react'

import { IconSoundPlay } from '@components/atoms/common/icons/IconSoundPlay'
import { IconSoundStop } from '@components/atoms/common/icons/IconSoundStop'
import BookStage from '@components/atoms/story/book/BookStage'
import ChevIconLeft from '@components/atoms/story/book/ChevIconLeft'
import ChevIconRight from '@components/atoms/story/book/ChevIconRight'
import PlayButton from '@components/atoms/story/book/PlayButton'
import SideClickArea from '@components/atoms/story/book/SideClickArea'

type StoryBookDesktopChromeProps = {
  children: ReactNode
  hasPrev: boolean
  showRightSide: boolean
  onPrev: () => void
  onNext: () => void
  showPlayButton: boolean
  isPlaying: boolean
  onTogglePlay: (e: MouseEvent<HTMLButtonElement>) => void
}

/**
 * 데스크톱(마우스) 책 chrome.
 * - 좌·우 큰 영역을 클릭으로 페이지 넘김
 * - 우측 영역 안쪽 하단에 재생/일시정지 floating 버튼
 */
export default function StoryBookDesktopChrome({
  children,
  hasPrev,
  showRightSide,
  onPrev,
  onNext,
  showPlayButton,
  isPlaying,
  onTogglePlay,
}: StoryBookDesktopChromeProps) {
  return (
    <>
      <SideClickArea
        $side='left'
        $visible={hasPrev}
        onClick={hasPrev ? onPrev : undefined}
      >
        {hasPrev && <ChevIconLeft alt='이전 페이지' />}
      </SideClickArea>
      <BookStage>{children}</BookStage>
      <SideClickArea $side='right' $visible={showRightSide} onClick={onNext}>
        {showRightSide && <ChevIconRight alt='다음 페이지' />}
        {showPlayButton && (
          <PlayButton onClick={onTogglePlay}>
            {isPlaying ? (
              <IconSoundStop alt='일시정지' />
            ) : (
              <IconSoundPlay alt='재생' />
            )}
          </PlayButton>
        )}
      </SideClickArea>
    </>
  )
}
