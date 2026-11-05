import { useEffect, useRef, useState } from 'react'

import type { RefObject } from 'react'

/**
 * 블랭크 채운 뒤 delayMs 후 스크롤 및 진행
 * - delayMs 후 스크롤 또는 onComplete
 * - 스크롤 완료 시 onScrollComplete 콜백
 */
export type UseSummary2DelayedScrollParams = {
  scrollContainerRef: RefObject<HTMLDivElement | null>
  targetRef: RefObject<HTMLSpanElement | null>
  delayMs?: number
  scrollDuration?: number
  /** 윈도우 높이 기준 위치 비율 (0.33 = 33%) */
  windowTargetYRatio?: number
  selectedAnswersLength: number
  blankCount: number
  onComplete?: () => void
  onScrollComplete: (optionIdToRemove: string | null) => void
}

export function useSummary2DelayedScroll({
  scrollContainerRef,
  targetRef,
  delayMs = 1000,
  scrollDuration = 800,
  windowTargetYRatio = 0.33,
  selectedAnswersLength,
  blankCount,
  onComplete,
  onScrollComplete,
}: UseSummary2DelayedScrollParams) {
  const [delayedScrollTrigger, setDelayedScrollTrigger] = useState(0)
  const pendingRemovalOptionIdRef = useRef<string | null>(null)
  const onScrollCompleteRef = useRef(onScrollComplete)

  // 최신 onScrollComplete 콜백을 ref에 동기화 (render 중 변경 금지)
  useEffect(() => {
    onScrollCompleteRef.current = onScrollComplete
  }, [onScrollComplete])

  const runScrollToNextBlank = (onDone?: () => void) => {
    const scrollEl = scrollContainerRef.current
    const targetEl = targetRef.current
    if (!scrollEl || !targetEl) return

    const measureAndScroll = () => {
      const startTop = scrollEl.scrollTop
      const scrollRect = scrollEl.getBoundingClientRect()
      const targetRect = targetEl.getBoundingClientRect()
      const targetCenterInContent =
        startTop + (targetRect.top - scrollRect.top) + targetEl.clientHeight / 2
      const windowTargetY = window.innerHeight * windowTargetYRatio
      const targetTop = Math.max(
        0,
        Math.min(
          targetCenterInContent - (windowTargetY - scrollRect.top),
          scrollEl.scrollHeight - scrollEl.clientHeight,
        ),
      )
      const distance = targetTop - startTop
      const startTime = performance.now()

      const animate = (now: number) => {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / scrollDuration, 1)
        const easeProgress = 1 - (1 - progress) ** 2
        scrollEl.scrollTop = startTop + distance * easeProgress
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          onDone?.()
        }
      }
      requestAnimationFrame(animate)
    }

    requestAnimationFrame(measureAndScroll)
  }

  useEffect(() => {
    if (delayedScrollTrigger === 0) return

    const timer = setTimeout(() => {
      const optionIdToRemove = pendingRemovalOptionIdRef.current

      if (selectedAnswersLength === blankCount && onComplete) {
        onScrollCompleteRef.current(optionIdToRemove)
        pendingRemovalOptionIdRef.current = null
        onComplete()
      } else {
        runScrollToNextBlank(() => {
          onScrollCompleteRef.current(optionIdToRemove)
          pendingRemovalOptionIdRef.current = null
        })
      }
      setDelayedScrollTrigger(0)
    }, delayMs)

    return () => clearTimeout(timer)
  }, [
    delayedScrollTrigger,
    selectedAnswersLength,
    blankCount,
    onComplete,
    delayMs,
  ])

  const trigger = () => setDelayedScrollTrigger((prev) => prev + 1)
  const setPendingRemovalId = (id: string | null) => {
    pendingRemovalOptionIdRef.current = id
  }

  return { trigger, setPendingRemovalId }
}
