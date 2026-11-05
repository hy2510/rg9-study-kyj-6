import { useMemo } from 'react'

import styled from 'styled-components'

import Sentence from '@components/molecules/story/Sentence'
import { useStoryPageBackgroundReady } from '@hooks/story/useStoryPageBackgroundReady'
import { SpeakPageProps as SpeakPageData } from '@src/interfaces/study/speak/ISpeak'

type SpeakPageSquareProps = {
  pageNumber: number
  imageSrc: string
  pageWidth: number
  pageHeight: number
  speakData: SpeakPageData[]
  activeSequence: number
  onSentenceClick?: () => void
}

export default function SpeakPageSquare({
  pageNumber,
  imageSrc,
  pageWidth,
  pageHeight,
  speakData,
  activeSequence,
  onSentenceClick,
}: SpeakPageSquareProps) {
  const imageReady = useStoryPageBackgroundReady(imageSrc)

  const css = useMemo(() => {
    const pageMeta = speakData.find(
      (d) => d.Page === pageNumber && d.Sequence === 999,
    )
    if (!pageMeta?.Css) return ''
    return pageMeta.Css.replace(/#t/g, `#t_${pageNumber}_`)
  }, [pageNumber, speakData])

  const sentences = useMemo(() => {
    const seen = new Set<number>()
    return speakData.filter((d) => {
      if (d.Page !== pageNumber || d.Sequence === 999) return false
      if (seen.has(d.Sequence)) return false
      seen.add(d.Sequence)
      return true
    })
  }, [pageNumber, speakData])

  return (
    <EbookPage>
      <TextWrapper
        $width={pageWidth}
        $height={pageHeight}
        $imageUrl={imageSrc}
        $imageReady={imageReady}
      >
        {css && <div dangerouslySetInnerHTML={{ __html: css }} />}
        {sentences.map((data) => (
          <Sentence
            key={`${data.Page}-${data.Sequence}`}
            pageNumber={data.Page}
            sequence={data.Sequence}
            sentence={data.Contents}
            marginTop={data.MarginTop}
            marginLeft={data.MarginLeft}
            clickSentence={onSentenceClick ? () => onSentenceClick() : () => {}}
            highlightColor={
              data.Sequence === activeSequence ? data.FontColor : undefined
            }
          />
        ))}
      </TextWrapper>
    </EbookPage>
  )
}

const EbookPage = styled.div`
  position: relative;
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
