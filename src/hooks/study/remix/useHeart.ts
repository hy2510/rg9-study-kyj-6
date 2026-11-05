// src/hooks/study/remix/useHeart.ts
import { useCallback, useEffect, useRef, useState } from 'react'

export interface HeartState {
  currentHeart: number
  maxHeart: number
  decreaseHeart: () => void
  increaseHeart: (amount: number) => void
  resetHeart: () => void
  isHeartEmpty: boolean
  currentShield: number
  maxShield: number
  decreaseShield: (amount?: number) => void
  increaseShield: (amount?: number) => void
  resetShield: () => void
  hasShield: boolean
}

export function useHeart(
  initialHeart: number = 5,
  maxHeart: number = 5,
): HeartState {
  const [currentHeart, setCurrentHeart] = useState(initialHeart)
  const [currentShield, setCurrentShield] = useState(0)
  const maxShield = 1
  const prevMaxHeartRef = useRef(maxHeart)

  // maxHeart가 증가하면 currentHeart도 같은 양만큼 증가
  useEffect(() => {
    if (maxHeart > prevMaxHeartRef.current) {
      const diff = maxHeart - prevMaxHeartRef.current
      setCurrentHeart((prev) => Math.min(prev + diff, maxHeart))
    }
    prevMaxHeartRef.current = maxHeart
  }, [maxHeart])

  const decreaseHeart = useCallback(() => {
    setCurrentHeart((prev) => Math.max(0, prev - 1))
  }, [])

  const increaseHeart = useCallback(
    (amount: number = 1) => {
      setCurrentHeart((prev) => Math.min(maxHeart, prev + amount))
    },
    [maxHeart],
  )

  const resetHeart = useCallback(() => {
    setCurrentHeart(maxHeart)
  }, [maxHeart])

  const decreaseShield = useCallback((amount: number = 1) => {
    setCurrentShield((prev) => Math.max(0, prev - amount))
  }, [])

  const increaseShield = useCallback((amount: number = 1) => {
    setCurrentShield((prev) => Math.min(maxShield, prev + amount))
  }, [])

  const resetShield = useCallback(() => {
    setCurrentShield(0)
  }, [])

  return {
    currentHeart,
    maxHeart,
    decreaseHeart,
    increaseHeart,
    resetHeart,
    isHeartEmpty: currentHeart <= 0,
    currentShield,
    maxShield,
    decreaseShield,
    increaseShield,
    resetShield,
    hasShield: currentShield > 0,
  }
}
