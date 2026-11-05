import { useEffect, useRef } from 'react'

import { isTextEntryKeyboardTarget } from '@utils/story/storyPCHelpers'

type UseStoryKeyboardNavArgs = {
  enabled: boolean
  singlePagePortrait: boolean
  onPrev: () => void
  onNext: () => void
  onPrevHalf: () => void
  onNextHalf: () => void
  onTogglePlay: () => void
}

/**
 * 키보드 네비게이션 hook (ArrowLeft / ArrowRight / Space).
 * - input/textarea 등 텍스트 입력 요소에 포커스 중이면 무시
 * - `singlePagePortrait` 시 Half 버전 호출
 */
export default function useStoryKeyboardNav({
  enabled,
  singlePagePortrait,
  onPrev,
  onNext,
  onPrevHalf,
  onNextHalf,
  onTogglePlay,
}: UseStoryKeyboardNavArgs) {
  const handlersRef = useRef({
    onPrev,
    onNext,
    onPrevHalf,
    onNextHalf,
    onTogglePlay,
  })

  useEffect(() => {
    handlersRef.current = {
      onPrev,
      onNext,
      onPrevHalf,
      onNextHalf,
      onTogglePlay,
    }
  }, [onPrev, onNext, onPrevHalf, onNextHalf, onTogglePlay])

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || isTextEntryKeyboardTarget(e.target)) return

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (singlePagePortrait) {
          handlersRef.current.onPrevHalf()
        } else {
          handlersRef.current.onPrev()
        }
        return
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault()
        if (singlePagePortrait) {
          handlersRef.current.onNextHalf()
        } else {
          handlersRef.current.onNext()
        }
        return
      }

      if (e.key === ' ' || e.code === 'Space' || e.key === 'Spacebar') {
        e.preventDefault()
        handlersRef.current.onTogglePlay()
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [enabled, singlePagePortrait])
}
