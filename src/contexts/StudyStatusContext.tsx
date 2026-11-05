import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

import type { HeaderProps } from '@interfaces/common/header/HeaderProps'
import type { HeaderStudyProps } from '@interfaces/common/header/HeaderStudyProps'

export type StudyStatusValue = {
  show: boolean
  timeText: string
  currentHeart: number
  statusLabel?: string
  /** Review Fail 등에서 시계/하트와 함께 좌측에 서브틀 라벨로 표시할 배지 텍스트 */
  reviewBadge?: string
  isReviewMode: boolean
  reviewCurrent?: number
  reviewTotal?: number
  questionNumber?: number
  setQuestionNumberVisible: (visible: boolean) => void
}

const StudyStatusContext = createContext<StudyStatusValue | null>(null)

function studyStatusFromHeader(headerProps: HeaderProps): StudyStatusValue {
  if (headerProps.variant !== 'study') {
    return {
      show: false,
      timeText: '',
      currentHeart: 0,
      isReviewMode: false,
      setQuestionNumberVisible: () => undefined,
    }
  }

  const studyProps = headerProps as HeaderStudyProps
  const remix = studyProps.engine === 'remix' ? studyProps : null

  return {
    show: !!studyProps.shouldShowCenterInfo,
    timeText: studyProps.formatTime(
      studyProps.time.timeMin,
      studyProps.time.timeSec,
    ),
    currentHeart: studyProps.currentHeart,
    statusLabel: studyProps.statusLabel,
    reviewBadge: studyProps.reviewBadge,
    isReviewMode: remix?.quizInfo.mode === 'Review',
    reviewCurrent: remix?.reviewCurrent,
    reviewTotal: remix?.reviewTotal,
    questionNumber: studyProps.questionNumber,
    setQuestionNumberVisible: () => undefined,
  }
}

export function StudyStatusProvider({
  headerProps,
  children,
}: {
  headerProps: HeaderProps
  children: ReactNode
}) {
  const [questionNumberVisible, setQuestionNumberVisible] = useState(true)
  const setVisibility = useCallback((visible: boolean) => {
    setQuestionNumberVisible(visible)
  }, [])
  const value = useMemo(() => {
    const status = studyStatusFromHeader(headerProps)
    return {
      ...status,
      questionNumber: questionNumberVisible ? status.questionNumber : undefined,
      setQuestionNumberVisible: setVisibility,
    }
  }, [headerProps, questionNumberVisible, setVisibility])
  return (
    <StudyStatusContext.Provider value={value}>
      {children}
    </StudyStatusContext.Provider>
  )
}

export function useStudyStatus() {
  return useContext(StudyStatusContext)
}
