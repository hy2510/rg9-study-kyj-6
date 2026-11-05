import { useMemo } from 'react'

import styled from 'styled-components'

import Sentence from '@components/molecules/story/Sentence'
import { useStoryPageBackgroundReady } from '@hooks/story/useStoryPageBackgroundReady'
import { PageProps, PageSequenceProps } from '@src/interfaces/story/IStory'

export type StoryPageSquareViewProps = {
  pageNumber: number
  imageSrc: string
  /** naturalWidth — 7th StoryPageSquare */
  pageWidth: number
  /** naturalHeight — data-original-height / 스케일 분모(첫 페이지)와 동일 계열 */
  pageHeight: number
  storyData: PageProps[]
  isTextShow: boolean
  pageSeq: PageSequenceProps
  currentTime: number
  isHighlight: boolean
  clickSentence: (page: number, sequence: number) => void
}

/**
 * 7th common/StoryPageSquare + e-book-square: natural 크기 text_wrapper,
 * backgroundSize = natural px. App.scss `.t { scale(0.25) }` 와 동일하게 페이지 내 스코프.
 */
export default function StoryPageSquare({
  pageNumber,
  imageSrc,
  pageWidth,
  pageHeight,
  storyData,
  isTextShow,
  pageSeq,
  currentTime,
  isHighlight,
  clickSentence,
}: StoryPageSquareViewProps) {
  const css = useMemo(() => {
    const pageMeta = storyData.find(
      (data) => data.Page === pageNumber && data.Sequence === 999,
    )
    if (!pageMeta?.Css) return ''
    return pageMeta.Css.replace(/#t/g, `#t_${pageNumber}_`)
  }, [pageNumber, storyData])

  const imageReady = useStoryPageBackgroundReady(imageSrc)

  const sentencesData = useMemo(
    () => storyData.filter((data) => data.Page === pageNumber),
    [pageNumber, storyData],
  )

  /** 문장 사이 무음 gap 에서 하이라이트가 순간 꺼졌다 켜지는 blink 를 제거하기 위해
   *  각 문장의 유지 종료 시각을 (원본 EndTime, 다음 문장 StartTime) 중 큰 값으로 확장 */
  const holdUntilMap = useMemo(() => {
    const map = new Map<number, number>()
    const actual = sentencesData
      .filter((d) => d.Sequence !== 999)
      .slice()
      .sort((a, b) => a.StartTime - b.StartTime)
    actual.forEach((data, idx) => {
      const nextStart = actual[idx + 1]?.StartTime
      const end =
        nextStart !== undefined
          ? Math.max(data.EndTime, nextStart)
          : data.EndTime
      map.set(data.Sequence, end)
    })
    return map
  }, [sentencesData])

  return (
    <EbookPage>
      <TextWrapper
        data-original-height={pageHeight}
        data-original-width={pageWidth}
        $width={pageWidth}
        $height={pageHeight}
        $imageUrl={imageSrc}
        $imageReady={imageReady}
      >
        {css && <div dangerouslySetInnerHTML={{ __html: css }} />}

        {isTextShow &&
          sentencesData.map((data) => {
            const holdUntil = holdUntilMap.get(data.Sequence) ?? data.EndTime
            const isCurrentHighlight =
              pageSeq.playPage === pageNumber &&
              data.Sequence !== 999 &&
              currentTime >= data.StartTime / 1000 &&
              currentTime < holdUntil / 1000 &&
              isHighlight

            return (
              <Sentence
                key={`${pageNumber}-${data.Sequence}`}
                pageNumber={pageNumber}
                sequence={data.Sequence}
                sentence={data.Contents}
                marginTop={data.MarginTop}
                marginLeft={data.MarginLeft}
                clickSentence={clickSentence}
                highlightColor={isCurrentHighlight ? data.FontColor : undefined}
              />
            )
          })}
      </TextWrapper>
    </EbookPage>
  )
}

const EbookPage = styled.div`
  position: relative;
  letter-spacing: 0;
  flex-shrink: 0;
`

const TextWrapper = styled.div<{
  $width: number
  $height: number
  $imageUrl: string
  $imageReady: boolean
}>`
  position: relative;
  width: ${({ $width }) => $width}px;
  height: ${({ $height }) => $height}px;
  background-image: ${({ $imageReady, $imageUrl }) =>
    $imageReady ? `url(${$imageUrl})` : 'none'};
  background-color: #fff;
  background-repeat: no-repeat;
  background-position: center;
  background-size: ${({ $width, $height }) => `${$width}px ${$height}px`};
  flex-shrink: 0;
  overflow: hidden;
`
