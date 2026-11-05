import { useLayoutEffect, useRef, useState } from 'react'

type UseStoryPageFlipAnimationArgs = {
  pageNumber: number
  spreadHalf: 0 | 1
  singlePagePortrait: boolean
}

type FlipState = {
  seq: number
  dir: 'next' | 'prev'
}

/**
 * 페이지·세로 반쪽(portrait half) 전환 시 책장 넘김 애니메이션 방향을 결정.
 *
 * - `pageNumber`가 변하면 dir = 큰쪽/작은쪽 비교로 next/prev
 * - `singlePagePortrait`에서 `pageNumber` 변경 직후의 spreadHalf 변경 1회는 두 단계 rAF로 무시 (페이지 자체 넘김과 합쳐지는 spreadHalf 잔여 변동 방지)
 * - 그 외 portrait + spreadHalf만 변경 시 spreadHalf 비교로 next/prev
 */
export default function useStoryPageFlipAnimation({
  pageNumber,
  spreadHalf,
  singlePagePortrait,
}: UseStoryPageFlipAnimationArgs) {
  const [flip, setFlip] = useState<FlipState>({ seq: 0, dir: 'next' })
  const [hasFlipAnimation, setHasFlipAnimation] = useState(false)

  /** 페이지·세로 반쪽 전환에 맞춰 넘김 방향 애니메이션 동기화 (spreadHalf만 바뀔 때도 dir 갱신) */
  const prevFlipAnchorRef = useRef<{
    pageNumber: number
    spreadHalf: 0 | 1
  } | null>(null)
  const suppressNextPortraitHalfFlipRef = useRef(false)
  const suppressPortraitHalfFlipGenRef = useRef(0)

  /** spread 동기화 layout 이후 최종 pageNumber·spreadHalf 기준으로 넘김 방향 결정 */
  useLayoutEffect(() => {
    if (prevFlipAnchorRef.current === null) {
      prevFlipAnchorRef.current = { pageNumber, spreadHalf }
      return
    }

    const prev = prevFlipAnchorRef.current
    let dir: 'next' | 'prev' | null = null

    if (pageNumber !== prev.pageNumber) {
      dir = pageNumber > prev.pageNumber ? 'next' : 'prev'
      if (singlePagePortrait) {
        suppressNextPortraitHalfFlipRef.current = true
        const gen = ++suppressPortraitHalfFlipGenRef.current
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (suppressPortraitHalfFlipGenRef.current === gen) {
              suppressNextPortraitHalfFlipRef.current = false
            }
          })
        })
      }
      prevFlipAnchorRef.current = { pageNumber, spreadHalf }
    } else if (singlePagePortrait && spreadHalf !== prev.spreadHalf) {
      if (suppressNextPortraitHalfFlipRef.current) {
        suppressNextPortraitHalfFlipRef.current = false
        prevFlipAnchorRef.current = { pageNumber, spreadHalf }
        return
      }
      dir = spreadHalf > prev.spreadHalf ? 'next' : 'prev'
      prevFlipAnchorRef.current = { pageNumber, spreadHalf }
    } else {
      prevFlipAnchorRef.current = { pageNumber, spreadHalf }
    }

    if (dir === null) return
    const animDir = dir

    setHasFlipAnimation(true)
    setFlip((f) => ({ seq: f.seq + 1, dir: animDir }))
  }, [pageNumber, singlePagePortrait, spreadHalf])

  return { flip, hasFlipAnimation }
}
