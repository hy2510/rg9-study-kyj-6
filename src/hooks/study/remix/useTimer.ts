import { useCallback, useEffect, useRef, useState } from 'react'

export interface TimerState {
  time: {
    timeMin: number
    timeSec: number
  }
  currentTime: number // 현재 남은 시간 (초 단위)
  initialTime: number // 초기 시간 (초 단위)
  setup: (time: number) => void // 초기 시간 설정 (초 단위)
  increaseTime: (time: number) => void // 시간 추가 (초 단위)
  startTimer: () => void
  pauseTimer: () => void
  resumeTimer: () => void
  resetTimer: () => void
  isFinished: boolean
  setTimeInterval: (interval: number) => void // 타이머 간격 설정 (밀리초 단위)
}

export function useTimer(): TimerState {
  const [remainingTime, setRemainingTime] = useState(0) // 남은 시간 (초)
  const [initialTime, setInitialTime] = useState(0) // 초기 시간 (초)
  const [timeInterval, setTimeIntervalState] = useState(1000) // 타이머 간격 (밀리초, 기본값 1000ms = 1초)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null) // 타이머 시작 시점
  const pausedTimeRef = useRef<number>(0) // 일시정지 시점의 남은 시간

  // 분과 초로 변환
  const time = {
    timeMin: Math.floor(remainingTime / 60),
    timeSec: remainingTime % 60,
  }

  const setup = useCallback((time: number) => {
    // 기존 타이머 정리
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    setRemainingTime(time)
    setInitialTime(time) // 초기 시간 저장
    pausedTimeRef.current = time
    startTimeRef.current = null
  }, [])

  const increaseTime = useCallback((addedTime: number) => {
    setRemainingTime((prev) => {
      const newTime = Math.min(prev + addedTime, 1200) // 최대 20분(1200초)으로 제한
      // 타이머가 실행 중이 아니면 pausedTimeRef도 업데이트
      if (!timerRef.current) {
        pausedTimeRef.current = newTime
      }
      return newTime
    })
  }, [])

  const startTimer = useCallback(() => {
    // 타이머가 실행 중이 아니고, 남은 시간이 있을 때만 시작
    if (!timerRef.current && remainingTime > 0) {
      startTimeRef.current = Date.now()
      pausedTimeRef.current = remainingTime

      timerRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 0) {
            if (timerRef.current) {
              clearInterval(timerRef.current)
              timerRef.current = null
            }
            return 0
          }
          return prev - 1
        })
      }, timeInterval)
    }
  }, [remainingTime, timeInterval])

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null

      // 현재 남은 시간 저장
      pausedTimeRef.current = remainingTime
    }
  }, [remainingTime])

  const resumeTimer = useCallback(() => {
    // 타이머가 실행 중이 아니고, 남은 시간이 있을 때만 재개
    if (!timerRef.current && remainingTime > 0) {
      startTimeRef.current = Date.now()

      timerRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 0) {
            if (timerRef.current) {
              clearInterval(timerRef.current)
              timerRef.current = null
            }
            return 0
          }
          return prev - 1
        })
      }, timeInterval)
    }
  }, [remainingTime, timeInterval])

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    setRemainingTime(pausedTimeRef.current)
    startTimeRef.current = null
  }, [])

  const setTimeInterval = useCallback(
    (interval: number) => {
      setTimeIntervalState(interval)
      // 타이머가 실행 중이면 재시작하여 새로운 간격 적용
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
        // resumeTimer를 호출하여 새로운 간격으로 재시작
        if (remainingTime > 0) {
          startTimeRef.current = Date.now()
          timerRef.current = setInterval(() => {
            setRemainingTime((prev) => {
              if (prev <= 0) {
                if (timerRef.current) {
                  clearInterval(timerRef.current)
                  timerRef.current = null
                }
                return 0
              }
              return prev - 1
            })
          }, interval)
        }
      }
    },
    [remainingTime],
  )

  // 시간이 0이 되면 자동으로 정지
  useEffect(() => {
    if (remainingTime <= 0 && timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [remainingTime])

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  return {
    time,
    currentTime: remainingTime, // 현재 남은 시간 (초 단위)
    initialTime, // 초기 시간 (초 단위)
    setup,
    increaseTime,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    isFinished: remainingTime <= 0,
    setTimeInterval, // 타이머 간격 설정
  }
}
