import { type TouchEvent, useCallback, useRef } from 'react'

const MIN_SWIPE_DISTANCE_PX = 44

type UseStoryBookSwipeArgs = {
  onSwipeLeft: () => void
  onSwipeRight: () => void
}

/**
 * 책 영역 터치 스와프 제스처 처리 hook.
 * - 가로 이동량이 세로 이동량보다 의미있게 크고 최소 거리(44px)를 넘으면 스와프로 인식
 * - 왼쪽으로 스와프(`dx < 0`) → `onSwipeLeft` (= 다음 페이지)
 * - 오른쪽으로 스와프(`dx > 0`) → `onSwipeRight` (= 이전 페이지)
 */
export default function useStoryBookSwipe({
  onSwipeLeft,
  onSwipeRight,
}: UseStoryBookSwipeArgs) {
  const swipeStartRef = useRef<{
    x: number
    y: number
    id: number
  } | null>(null)

  const onTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return
    const t = e.touches[0]
    swipeStartRef.current = { x: t.clientX, y: t.clientY, id: t.identifier }
  }, [])

  const onTouchCancel = useCallback(() => {
    swipeStartRef.current = null
  }, [])

  const onTouchEnd = useCallback(
    (e: TouchEvent<HTMLDivElement>) => {
      const start = swipeStartRef.current
      swipeStartRef.current = null
      if (!start || e.changedTouches.length === 0) return
      const t = Array.from(e.changedTouches).find(
        (c) => c.identifier === start.id,
      )
      if (!t) return

      const dx = t.clientX - start.x
      const dy = t.clientY - start.y
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)
      if (absDx < MIN_SWIPE_DISTANCE_PX || absDx <= absDy * 1.05) return

      if (dx < 0) {
        onSwipeLeft()
      } else {
        onSwipeRight()
      }
    },
    [onSwipeLeft, onSwipeRight],
  )

  return { onTouchStart, onTouchCancel, onTouchEnd }
}
