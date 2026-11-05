import { type RefObject, useLayoutEffect, useState } from 'react'

import { styled } from 'styled-components'

import StoryPageSquare from '@components/organisms/story/StoryPageSquare'
import { PageProps, PageSequenceProps } from '@src/interfaces/story/IStory'

export type StoryBodySquareProps = {
  /** StoryPC 래퍼 — 7th StoryBodySquare의 ebook_contents와 동일한 가용 높이 */
  measureRef: RefObject<HTMLDivElement | null>
  leftPage: PageProps
  rightPage: PageProps
  /** 모바일 세로: 한 장만 표시 */
  singlePage?: PageProps | null
  storyData: PageProps[]
  pageSeq: PageSequenceProps
  currentTime: number
  isTextShow: boolean
  isHighlight: boolean
  clickSentence: (page: number, sequence: number) => void
  getPageWidth: (imageUrl: string) => number
  getPageHeight: (imageUrl: string) => number
}

/**
 * 7th StoryBodySquare는 첫 text_wrapper 높이로만 스케일하지만, 좌·우 natural 높이가 다르면
 * 클립 박스(naturalHeight = max)가 스케일된 높이보다 커져 상하가 잘린다.
 * 스케일 분모는 max(좌H, 우H)이고, 가로도 넘치지 않게 min(세로, 가로) 스케일 적용.
 */
export default function StoryBodySquare({
  measureRef,
  leftPage,
  rightPage,
  singlePage = null,
  storyData,
  pageSeq,
  currentTime,
  isTextShow,
  isHighlight,
  clickSentence,
  getPageWidth,
  getPageHeight,
}: StoryBodySquareProps) {
  const [scale, setScale] = useState(1)

  const leftW = getPageWidth(leftPage.ImagePath)
  const leftH = getPageHeight(leftPage.ImagePath)
  const rightW = getPageWidth(rightPage.ImagePath)
  const rightH = getPageHeight(rightPage.ImagePath)

  const naturalWidth = singlePage
    ? getPageWidth(singlePage.ImagePath)
    : leftW + rightW
  const naturalHeight = singlePage
    ? getPageHeight(singlePage.ImagePath)
    : Math.max(leftH, rightH, 1)

  useLayoutEffect(() => {
    const calcScale = () => {
      const el = measureRef.current
      if (!el || naturalHeight <= 0 || naturalWidth <= 0) return
      const availableHeight = el.clientHeight
      const availableWidth = el.clientWidth
      if (availableHeight <= 0 || availableWidth <= 0) return
      const scaleH = availableHeight / naturalHeight
      const scaleW = availableWidth / naturalWidth
      setScale(Math.min(scaleH, scaleW))
    }

    calcScale()
    const raf = requestAnimationFrame(calcScale)
    const observer = new ResizeObserver(calcScale)
    if (measureRef.current) observer.observe(measureRef.current)
    window.addEventListener('resize', calcScale)
    window.addEventListener('orientationchange', calcScale)
    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      window.removeEventListener('resize', calcScale)
      window.removeEventListener('orientationchange', calcScale)
    }
  }, [measureRef, naturalHeight, naturalWidth])

  const scaledWidth = naturalWidth * scale
  const scaledHeight = naturalHeight * scale

  if (singlePage) {
    const pw = getPageWidth(singlePage.ImagePath)
    const ph = getPageHeight(singlePage.ImagePath)
    return (
      <EbookBodyPc $scaledWidth={scaledWidth} $scaledHeight={scaledHeight}>
        <EbookPagesScaled
          $scale={scale}
          $naturalWidth={naturalWidth}
          $naturalHeight={naturalHeight}
        >
          <StoryPageSquare
            pageNumber={singlePage.Page}
            imageSrc={singlePage.ImagePath}
            pageWidth={pw}
            pageHeight={ph}
            storyData={storyData}
            isTextShow={isTextShow}
            pageSeq={pageSeq}
            currentTime={currentTime}
            isHighlight={isHighlight}
            clickSentence={clickSentence}
          />
        </EbookPagesScaled>
      </EbookBodyPc>
    )
  }

  return (
    <EbookBodyPc $scaledWidth={scaledWidth} $scaledHeight={scaledHeight}>
      <EbookPagesScaled
        $scale={scale}
        $naturalWidth={naturalWidth}
        $naturalHeight={naturalHeight}
      >
        <StoryPageSquare
          pageNumber={leftPage.Page}
          imageSrc={leftPage.ImagePath}
          pageWidth={leftW}
          pageHeight={leftH}
          storyData={storyData}
          isTextShow={isTextShow}
          pageSeq={pageSeq}
          currentTime={currentTime}
          isHighlight={isHighlight}
          clickSentence={clickSentence}
        />
        <StoryPageSquare
          pageNumber={rightPage.Page}
          imageSrc={rightPage.ImagePath}
          pageWidth={rightW}
          pageHeight={rightH}
          storyData={storyData}
          isTextShow={isTextShow}
          pageSeq={pageSeq}
          currentTime={currentTime}
          isHighlight={isHighlight}
          clickSentence={clickSentence}
        />
      </EbookPagesScaled>
    </EbookBodyPc>
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
  z-index: 3;
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
