import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

export type HeartState = {
  current: number
  max: number
  /** 활동이 fetch 후 `QuizAnswerCount`를 max 로 알리고, current 도 max 로 동기화 */
  setMax: (n: number) => void
  /**
   * `current` 만 명시값으로 세팅 (0 미만은 0 으로 클램프).
   *
   * 이어풀기 진입 시 `recordedData` 의 누적 오답을 한꺼번에 반영하기 위한 setter.
   * 일반적인 게임 진행 중에는 `decrease()` 만 사용하고, 이 setter 는 초기화
   * 시점에만 호출한다.
   */
  setCurrent: (n: number) => void
  /** 오답 시 1 감소 (Legacy 정책: 0 도달해도 게임오버 X — 다음 quiz 로 진행) */
  decrease: () => void
  /** 현재 max 로 current 만 reset */
  reset: () => void
  isEmpty: boolean
}

const HeartContext = createContext<HeartState | null>(null)

export const HeartContextProvider = HeartContext.Provider

/**
 * 컨테이너 측에서 보유하는 하트 state.
 * - 컨테이너가 직접 보유하므로 Header 가 Context 밖에 있어도 props 로 current/max 전달 가능
 * - `resetSignal` 파라미터는 하위 호환용으로 남겨두지만 내부에서 사용하지 않는다.
 *   각 활동이 mount 시 `setMax(QuizAnswerCount)` 로 하트를 초기화하므로, 부모의
 *   `useEffect` 리셋은 자식 setMax 를 덮어쓰는 순서 문제를 유발한다 (1번 문제 하트 0 노출 버그).
 *   하트를 노출하지 않는 활동(WA2 등) 은 `statusLabel` 로 대체 노출되므로 리셋 없이도 시각 이슈 없음.
 */
export function useHeartState(
  initialMax: number = 3,
  _resetSignal?: unknown,
): HeartState {
  void _resetSignal
  const [max, setMaxState] = useState<number>(initialMax)
  const [current, setCurrent] = useState<number>(initialMax)

  const setMax = useCallback((n: number) => {
    setMaxState(n)
    setCurrent(n)
  }, [])

  const setCurrentClamped = useCallback((n: number) => {
    setCurrent(Math.max(0, n))
  }, [])

  const decrease = useCallback(() => {
    setCurrent((prev) => Math.max(0, prev - 1))
  }, [])

  const reset = useCallback(() => {
    setCurrent(max)
  }, [max])

  return useMemo(
    () => ({
      current,
      max,
      setMax,
      setCurrent: setCurrentClamped,
      decrease,
      reset,
      isEmpty: current <= 0,
    }),
    [current, max, setMax, setCurrentClamped, decrease, reset],
  )
}

/** Provider 안에서만 호출되어야 한다. (밖에서 쓰면 throw) */
export function useHeartContext(): HeartState {
  const ctx = useContext(HeartContext)
  if (!ctx) {
    throw new Error('useHeartContext must be used within HeartContextProvider')
  }
  return ctx
}

/** Provider 가 없을 수도 있는 위치(예: Remix 활동) 용 안전 접근자. */
export function useHeartContextOptional(): HeartState | null {
  return useContext(HeartContext)
}
