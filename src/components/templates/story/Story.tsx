import { type MouseEvent, useCallback, useEffect, useMemo, useRef } from 'react'

import CenteredLoading from '@components/atoms/common/CenteredLoading'
import BookPagesMotion from '@components/atoms/story/book/BookPagesMotion'
import BookStage from '@components/atoms/story/book/BookStage'
import StoryPCWrapper from '@components/atoms/story/book/StoryPCWrapper'
import StoryBody from '@components/organisms/story/StoryBody'
import StoryBodySquare from '@components/organisms/story/StoryBodySquare'
import StoryBookDesktopChrome from '@components/organisms/story/StoryBookDesktopChrome'
import StoryBookTouchChrome from '@components/organisms/story/StoryBookTouchChrome'
import useImagePreload from '@hooks/common/useImagePreload'
import { useDesktopStoryChrome } from '@hooks/story/useDesktopStoryChrome'
import { useMobileStoryPortrait } from '@hooks/story/useMobileStoryPortrait'
import useStoryAudioPC from '@hooks/story/useStoryAudioPC'
import useStoryBookSwipe from '@hooks/story/useStoryBookSwipe'
import useStoryKeyboardNav from '@hooks/story/useStoryKeyboardNav'
import useStoryPageFlipAnimation from '@hooks/story/useStoryPageFlipAnimation'
import useStoryParentCallbacks from '@hooks/story/useStoryParentCallbacks'
import useStorySpreadHalfSync from '@hooks/story/useStorySpreadHalfSync'
import { getStoryReadingProfileFlags } from '@src/constants/story/storyReadingProfile'
import { StoryProps } from '@src/interfaces/story/IStory'
import { uniquePagesFromStory } from '@utils/story/storyPCHelpers'

export default function Story({
  bookLevel,
  studyId,
  studentHistoryId,
  isEbAnotherSizeYn,
  storyData,
  changeReadingComplete,
  isVisible = true,
  isMovieShow = false,
  toggleMovieShow: _toggleMovieShow,
  isReadingComplete: _isReadingComplete,
  onRegisterPause,
  onRegisterStop,
  onPageNumberChange,
  onRegisterChangeAutoNextPage,
  onAutoNextChange,
  onPlaybackRateChange,
  onRegisterChangePlaybackRate,
  onFinalNext,
  onImagesLoaded,
  readingProfile,
  hasHighlightData = true,
  bookInteractionMode = 'default',
}: StoryProps) {
  const uniquePages = useMemo(
    () => uniquePagesFromStory(storyData),
    [storyData],
  )

  const imageUrls = uniquePages.map((page) => page.ImagePath)
  const { isDone, sizeMap } = useImagePreload(imageUrls)

  useEffect(() => {
    if (isDone) onImagesLoaded?.()
  }, [isDone])

  const getPageWidth = (imageUrl: string) => sizeMap.get(imageUrl)?.width ?? 0
  const getPageHeight = (imageUrl: string) => sizeMap.get(imageUrl)?.height ?? 0

  const wrapperRef = useRef<HTMLDivElement>(null)

  const readingFlags = useMemo(
    () => getStoryReadingProfileFlags(readingProfile),
    [readingProfile],
  )

  const isSpeakMode = bookInteractionMode === 'speak'
  const isDesktopStoryChrome = useDesktopStoryChrome()
  const useTouchBookChrome = !isSpeakMode && !isDesktopStoryChrome
  const isMobilePortrait = useMobileStoryPortrait()
  const singlePagePortrait = isMobilePortrait && !isSpeakMode

  const {
    pageNumber,
    playState,
    pageSeq,
    currentTime,
    isAutoNext,
    playbackRate,
    play,
    pause,
    stop,
    changePageNumber,
    changeDuration,
    changePlaySpeed,
    changeAutoNextPage,
  } = useStoryAudioPC({
    studyId,
    studentHistoryId,
    pageData: storyData,
    changeReadingComplete,
    audioMuted: readingFlags.audioMuted,
    disableSpreadAutoAdvance: isSpeakMode,
    autoplayOnFirstLoad: !isSpeakMode,
    onLastPageEnded: onFinalNext,
  })

  const handlePlayPause = () => {
    if (playState === 'play') {
      pause()
    } else {
      play()
    }
  }

  // pageNumber(1-based 홀수) → 배열 인덱스(0-based)
  const pageIndex = pageNumber - 1
  const leftPage = uniquePages[pageIndex]
  const rightPage = uniquePages[pageIndex + 1]

  const hasPrev = pageIndex > 0
  const hasNext = pageIndex + 2 < uniquePages.length

  const {
    spreadHalf,
    setSpreadHalf,
    markPortraitAfterPrev,
    markRightPlayNeededAfterPrev,
  } = useStorySpreadHalfSync({
    isSpeakMode,
    singlePagePortrait,
    pageNumber,
    leftPage,
    rightPage,
    pageSeqPlayPage: pageSeq.playPage,
    changeDuration,
    storyData,
  })

  const handlePrev = () => {
    if (!hasPrev) return
    changePageNumber(pageNumber - 2)
  }

  const handleNext = () => {
    if (!hasNext) {
      onFinalNext?.()
      return
    }
    changePageNumber(pageNumber + 2)
  }

  const goNextPageOrHalf = useCallback(() => {
    if (singlePagePortrait) {
      if (spreadHalf === 0 && rightPage) {
        setSpreadHalf(1)
        return
      }
      if (!hasNext) {
        onFinalNext?.()
        return
      }
      changePageNumber(pageNumber + 2)
      return
    }
    if (!hasNext) {
      onFinalNext?.()
      return
    }
    changePageNumber(pageNumber + 2)
  }, [
    singlePagePortrait,
    spreadHalf,
    rightPage,
    hasNext,
    pageNumber,
    changePageNumber,
    onFinalNext,
    setSpreadHalf,
  ])

  const goPrevPageOrHalf = useCallback(() => {
    if (singlePagePortrait) {
      if (spreadHalf === 1) {
        setSpreadHalf(0)
        return
      }
      if (!hasPrev) return
      markRightPlayNeededAfterPrev()
      markPortraitAfterPrev()
      changePageNumber(pageNumber - 2)
      return
    }
    if (!hasPrev) return
    changePageNumber(pageNumber - 2)
  }, [
    singlePagePortrait,
    spreadHalf,
    hasPrev,
    pageNumber,
    changePageNumber,
    setSpreadHalf,
    markPortraitAfterPrev,
    markRightPlayNeededAfterPrev,
  ])

  const portraitSinglePage = useMemo(() => {
    if (!singlePagePortrait || !leftPage) return null
    return spreadHalf === 0 ? leftPage : (rightPage ?? leftPage)
  }, [singlePagePortrait, spreadHalf, leftPage, rightPage])

  const {
    onTouchStart: onBookSwipeTouchStart,
    onTouchCancel: onBookSwipeTouchCancel,
    onTouchEnd: onBookSwipeTouchEnd,
  } = useStoryBookSwipe({
    onSwipeLeft: goNextPageOrHalf,
    onSwipeRight: goPrevPageOrHalf,
  })

  useStoryKeyboardNav({
    enabled: isVisible && !isMovieShow && !isSpeakMode,
    singlePagePortrait,
    onPrev: handlePrev,
    onNext: handleNext,
    onPrevHalf: goPrevPageOrHalf,
    onNextHalf: goNextPageOrHalf,
    onTogglePlay: handlePlayPause,
  })

  useEffect(() => {
    if (!isVisible || isMovieShow || isSpeakMode) return
    wrapperRef.current?.focus({ preventScroll: true })
  }, [isVisible, isMovieShow, isSpeakMode])

  const { flip, hasFlipAnimation } = useStoryPageFlipAnimation({
    pageNumber,
    spreadHalf,
    singlePagePortrait,
  })

  useStoryParentCallbacks({
    onRegisterPause,
    pause,
    onRegisterStop,
    stop,
    isVisible,
    isMovieShow,
    playState,
    pageSeq,
    changeDuration,
    onPageNumberChange,
    uniquePages,
    pageNumber,
    singlePagePortrait,
    spreadHalf,
    onAutoNextChange,
    isAutoNext,
    onRegisterChangeAutoNextPage,
    changeAutoNextPage,
    onPlaybackRateChange,
    playbackRate,
    onRegisterChangePlaybackRate,
    changePlaySpeed,
  })

  const handleBookEdgeTapPrev = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      if (singlePagePortrait) goPrevPageOrHalf()
      else if (hasPrev) handlePrev()
    },
    [singlePagePortrait, goPrevPageOrHalf, hasPrev, handlePrev],
  )

  const handleBookEdgeTapNext = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      if (singlePagePortrait) goNextPageOrHalf()
      else handleNext()
    },
    [singlePagePortrait, goNextPageOrHalf, handleNext],
  )

  if (!isDone) return <CenteredLoading />

  // 도서에 하이라이트 데이터가 없는 경우(`HighlightDataYn === false`) 에는
  // 프로필이 무엇이든(예: basic/Focus·On) 절대 하이라이트를 렌더하지 않는다.
  const isSentenceHighlight =
    playState === 'play' &&
    readingFlags.showHighlightWhilePlaying &&
    hasHighlightData

  const bookBodyShared = {
    measureRef: wrapperRef,
    leftPage,
    rightPage: rightPage ?? leftPage,
    singlePage: portraitSinglePage,
    storyData,
    pageSeq,
    currentTime,
    isTextShow: readingFlags.showText,
    isHighlight: isSentenceHighlight,
    clickSentence: changeDuration,
  }

  const bookPages = isEbAnotherSizeYn ? (
    <StoryBodySquare
      {...bookBodyShared}
      getPageWidth={getPageWidth}
      getPageHeight={getPageHeight}
    />
  ) : (
    <StoryBody {...bookBodyShared} bookLevel={bookLevel} />
  )

  const bookMotionKey = `${pageNumber}-${flip.seq}${singlePagePortrait ? `-${spreadHalf}` : ''}`

  const animatedBookPages = (
    <BookPagesMotion
      key={bookMotionKey}
      $direction={flip.dir}
      $animate={hasFlipAnimation}
    >
      {bookPages}
    </BookPagesMotion>
  )

  if (isSpeakMode) {
    return (
      <StoryPCWrapper ref={wrapperRef} tabIndex={-1}>
        <BookStage>{animatedBookPages}</BookStage>
      </StoryPCWrapper>
    )
  }

  const handlePlayPauseButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    handlePlayPause()
  }

  const isPlaying = playState === 'play'

  return (
    <StoryPCWrapper
      ref={wrapperRef}
      tabIndex={-1}
      onPointerDown={() => wrapperRef.current?.focus({ preventScroll: true })}
    >
      {useTouchBookChrome ? (
        <StoryBookTouchChrome
          swipeHandlers={{
            onTouchStart: onBookSwipeTouchStart,
            onTouchCancel: onBookSwipeTouchCancel,
            onTouchEnd: onBookSwipeTouchEnd,
          }}
          showLeftTap={hasPrev || (singlePagePortrait && spreadHalf === 1)}
          showRightTap={hasNext || !isSpeakMode}
          onTapPrev={handleBookEdgeTapPrev}
          onTapNext={handleBookEdgeTapNext}
          showPlayButton={Boolean(rightPage ?? leftPage)}
          isPlaying={isPlaying}
          onTogglePlay={handlePlayPauseButtonClick}
        >
          {animatedBookPages}
        </StoryBookTouchChrome>
      ) : (
        <StoryBookDesktopChrome
          hasPrev={hasPrev}
          showRightSide={hasNext || !isSpeakMode}
          onPrev={handlePrev}
          onNext={handleNext}
          showPlayButton={Boolean(rightPage)}
          isPlaying={isPlaying}
          onTogglePlay={handlePlayPauseButtonClick}
        >
          {animatedBookPages}
        </StoryBookDesktopChrome>
      )}
    </StoryPCWrapper>
  )
}
