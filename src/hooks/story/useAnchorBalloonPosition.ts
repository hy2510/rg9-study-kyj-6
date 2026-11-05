import { type RefObject, useCallback, useLayoutEffect, useState } from 'react'

const GAP_BELOW_ANCHOR = 6

/**
 * 앵커 버튼 아래에 고정 말풍선을 붙일 때 `top` / `left` 계산
 */
export function useAnchorBalloonPosition(
  isOpen: boolean,
  anchorRef: RefObject<HTMLElement | null>,
  layoutTrigger: unknown,
  balloonWidth: number,
): { top: number; left: number } {
  const [pos, setPos] = useState({ top: 0, left: 0 })

  const update = useCallback(() => {
    if (typeof window === 'undefined') return
    const el = anchorRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    let left = cx - balloonWidth / 2
    const maxLeft = window.innerWidth - balloonWidth - 8
    left = Math.max(8, Math.min(left, maxLeft))
    setPos({ top: rect.bottom + GAP_BELOW_ANCHOR, left })
  }, [anchorRef, balloonWidth])

  useLayoutEffect(() => {
    if (!isOpen) return
    update()
    const onLayout = () => update()
    window.addEventListener('resize', onLayout)
    window.addEventListener('scroll', onLayout, true)
    const el = anchorRef.current
    let ro: ResizeObserver | undefined
    if (el && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(onLayout)
      ro.observe(el)
    }
    const t = window.setTimeout(onLayout, 320)
    return () => {
      window.removeEventListener('resize', onLayout)
      window.removeEventListener('scroll', onLayout, true)
      window.clearTimeout(t)
      ro?.disconnect()
    }
  }, [isOpen, layoutTrigger, update, anchorRef])

  return pos
}
