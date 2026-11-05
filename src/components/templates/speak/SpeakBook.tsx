import { useLayoutEffect, useMemo, useRef, useState } from 'react'

import styled from 'styled-components'

import BookStage from '@components/atoms/story/book/BookStage'
import StoryPCWrapper from '@components/atoms/story/book/StoryPCWrapper'
import SpeakPage from '@components/organisms/speak/SpeakPage'
import SpeakPageSquare from '@components/organisms/speak/SpeakPageSquare'
import useImagePreload from '@hooks/common/useImagePreload'
import { useMobileStoryPortrait } from '@hooks/story/useMobileStoryPortrait'
import { STORY_PAGE_REF_HEIGHT_PX } from '@src/constants/story/storyLayout'
import { SpeakPageProps } from '@src/interfaces/study/speak/ISpeak'
import { uniquePagesFromStory } from '@utils/story/storyPCHelpers'

type SpeakBookProps = {
  speakData: SpeakPageProps[]
  quizIndex: number
  bookLevel: string
  isEbAnotherSizeYn: boolean
  /**
   * 페이지 내 문장(sequence !== 999) 을 클릭했을 때 호출.
   * 컨테이너에서 현재 퀴즈 문장의 음원을 재생 → 재생 완료 후 녹음 팝업 표시.
   */
  onSentenceClick?: () => void
}

function getPageDesignWidth(bookLevel: string): number {
  return bookLevel.toUpperCase() === 'K' ? 480 : 525
}

export default function SpeakBook({
  speakData,
  quizIndex,
  bookLevel,
  isEbAnotherSizeYn,
  onSentenceClick,
}: SpeakBookProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  const pageDesignWidth = getPageDesignWidth(bookLevel)
  const isMobilePortrait = useMobileStoryPortrait()

  const uniquePages = useMemo(
    () => uniquePagesFromStory(speakData),
    [speakData],
  )

  const imageUrls = useMemo(
    () => uniquePages.map((p) => p.ImagePath),
    [uniquePages],
  )
  const { sizeMap } = useImagePreload(imageUrls)

  const getPageWidth = (url: string) => sizeMap.get(url)?.width ?? 0
  const getPageHeight = (url: string) => sizeMap.get(url)?.height ?? 0

  const currentPage = speakData[quizIndex]?.Page ?? 1
  const currentSequence = speakData[quizIndex]?.Sequence ?? -1

  const pageIndex = useMemo(
    () => uniquePages.findIndex((p) => p.Page === currentPage),
    [uniquePages, currentPage],
  )

  const spreadStartIndex = pageIndex % 2 === 0 ? pageIndex : pageIndex - 1
  const leftPage = uniquePages[spreadStartIndex]
  const rightPage = uniquePages[spreadStartIndex + 1]

  // 모바일 세로: 현재 퀴즈 페이지만 단독 표시
  const portraitPage = isMobilePortrait
    ? (uniquePages.find((p) => p.Page === currentPage) ?? leftPage)
    : null

  // 스프레드 자연 크기 계산
  let spreadWidthPx: number
  let spreadHeightPx: number

  if (isEbAnotherSizeYn) {
    if (portraitPage) {
      spreadWidthPx = getPageWidth(portraitPage.ImagePath)
      spreadHeightPx = getPageHeight(portraitPage.ImagePath)
    } else {
      const leftW = getPageWidth(leftPage?.ImagePath ?? '')
      const leftH = getPageHeight(leftPage?.ImagePath ?? '')
      const rightW = rightPage ? getPageWidth(rightPage.ImagePath) : 0
      const rightH = rightPage ? getPageHeight(rightPage.ImagePath) : 0
      spreadWidthPx = rightPage ? leftW + rightW : leftW
      spreadHeightPx = Math.max(leftH, rightH, 1)
    }
  } else {
    spreadHeightPx = STORY_PAGE_REF_HEIGHT_PX
    spreadWidthPx = portraitPage
      ? pageDesignWidth
      : rightPage
        ? pageDesignWidth * 2
        : pageDesignWidth
  }

  useLayoutEffect(() => {
    const calcScale = () => {
      const el = wrapperRef.current
      if (!el) return
      const w = el.clientWidth
      const h = el.clientHeight
      if (w <= 0 || h <= 0 || spreadWidthPx <= 0 || spreadHeightPx <= 0) return
      setScale(Math.min(h / spreadHeightPx, w / spreadWidthPx))
    }

    calcScale()
    const observer = new ResizeObserver(calcScale)
    if (wrapperRef.current) observer.observe(wrapperRef.current)
    window.addEventListener('orientationchange', calcScale)
    return () => {
      observer.disconnect()
      window.removeEventListener('orientationchange', calcScale)
    }
  }, [spreadWidthPx, spreadHeightPx])

  const scaledWidth = spreadWidthPx * scale
  const scaledHeight = spreadHeightPx * scale

  const renderPage = (page: SpeakPageProps, isActivePage: boolean) => {
    const active = isActivePage ? currentSequence : -1
    if (isEbAnotherSizeYn) {
      return (
        <SpeakPageSquare
          pageNumber={page.Page}
          imageSrc={page.ImagePath}
          pageWidth={getPageWidth(page.ImagePath)}
          pageHeight={getPageHeight(page.ImagePath)}
          speakData={speakData}
          activeSequence={active}
          onSentenceClick={onSentenceClick}
        />
      )
    }
    return (
      <SpeakPage
        pageNumber={page.Page}
        imageSrc={page.ImagePath}
        pageDesignWidth={pageDesignWidth}
        speakData={speakData}
        activeSequence={active}
        onSentenceClick={onSentenceClick}
      />
    )
  }

  return (
    <StoryPCWrapper ref={wrapperRef}>
      <BookStage>
        <EbookBodyPc $scaledWidth={scaledWidth} $scaledHeight={scaledHeight}>
          <EbookPagesScaled
            $scale={scale}
            $naturalWidth={spreadWidthPx}
            $naturalHeight={spreadHeightPx}
          >
            {portraitPage ? (
              renderPage(portraitPage, true)
            ) : (
              <>
                {leftPage &&
                  renderPage(leftPage, leftPage.Page === currentPage)}
                {rightPage &&
                  renderPage(rightPage, rightPage.Page === currentPage)}
              </>
            )}
          </EbookPagesScaled>
        </EbookBodyPc>
      </BookStage>
    </StoryPCWrapper>
  )
}

const EbookBodyPc = styled.div<{
  $scaledWidth: number
  $scaledHeight: number
}>`
  margin: auto;
  flex-shrink: 0;
  width: ${({ $scaledWidth }) => $scaledWidth}px;
  height: ${({ $scaledHeight }) => $scaledHeight}px;
  overflow: hidden;
`

const EbookPagesScaled = styled.div<{
  $scale: number
  $naturalWidth: number
  $naturalHeight: number
}>`
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  align-items: flex-start;
  justify-content: flex-start;
  width: ${({ $naturalWidth }) => $naturalWidth}px;
  height: ${({ $naturalHeight }) => $naturalHeight}px;
  transform: scale(${({ $scale }) => $scale});
  transform-origin: top left;
`
