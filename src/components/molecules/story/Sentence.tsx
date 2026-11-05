import { memo, useMemo, useRef } from 'react'

/** `StoryPC` BookSwipePane과 동일 기준 — 가로 스와이프는 문장 탭으로 처리하지 않음 */
const STORY_SWIPE_MIN_PX = 44
const STORY_SWIPE_DOMINANCE = 1.05

type SentenceProps = {
  pageNumber: number
  sentence: string
  sequence: number
  marginTop: number
  marginLeft: number
  clickSentence: (page: number, sequence: number) => void
  highlightColor?: string
}

function SentenceComponent({
  pageNumber,
  sentence,
  sequence,
  marginTop,
  marginLeft,
  clickSentence,
  highlightColor,
}: SentenceProps) {
  const touchStartRef = useRef<{
    x: number
    y: number
    id: number
  } | null>(null)

  /**
   * 문장 HTML은 하이라이트 여부와 무관하게 항상 동일한 결과를 반환한다.
   * → dangerouslySetInnerHTML 이 재삽입되지 않아 문장 노드가 유지되고,
   *   하이라이트는 외곽 div 의 CSS 변수(--sentence-highlight)만으로 처리된다.
   */
  const convertedHtml = useMemo(() => {
    const clickable = sequence !== 999
    const styleStr = `margin-top: ${marginTop}px; margin-left: ${marginLeft}px;${
      clickable ? ' cursor:pointer;' : ''
    }`
    return sentence.replace(
      /id="t/g,
      `style='${styleStr}' id="t_${pageNumber}_`,
    )
  }, [sentence, marginTop, marginLeft, pageNumber, sequence])

  const onClickHandler = () => {
    if (sequence !== 999) clickSentence(pageNumber, sequence)
  }

  const onTouchStartHandler = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return
    const t = e.touches[0]
    touchStartRef.current = { x: t.clientX, y: t.clientY, id: t.identifier }
  }

  const onTouchCancelHandler = () => {
    touchStartRef.current = null
  }

  const onTouchEndHandler = (e: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current
    touchStartRef.current = null
    if (!start || e.changedTouches.length === 0) return

    const t = Array.from(e.changedTouches).find(
      (c) => c.identifier === start.id,
    )
    if (!t) return

    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)
    const isBookSwipe =
      absDx >= STORY_SWIPE_MIN_PX && absDx > absDy * STORY_SWIPE_DOMINANCE

    if (isBookSwipe) {
      return
    }

    if (sequence !== 999) {
      e.preventDefault()
      onClickHandler()
    }
  }

  return (
    <div
      style={
        {
          '--sentence-highlight': highlightColor ?? 'transparent',
        } as React.CSSProperties
      }
      dangerouslySetInnerHTML={{ __html: convertedHtml }}
      onClick={onClickHandler}
      onTouchStart={onTouchStartHandler}
      onTouchCancel={onTouchCancelHandler}
      onTouchEnd={onTouchEndHandler}
    />
  )
}

/**
 * 부모(StoryPage 등)가 timeupdate 마다 재렌더돼도, 이 문장의 highlight/좌표 등
 * props 가 실제로 바뀌지 않으면 스킵 — 불필요한 style diff/DOM 접근을 제거해
 * 브라우저 페인트 부하 및 잔여 깜빡임을 최소화한다.
 */
const Sentence = memo(SentenceComponent)
export default Sentence
