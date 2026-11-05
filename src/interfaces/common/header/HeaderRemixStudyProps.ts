import { HeaderStudyBaseProps } from '@interfaces/common/header/HeaderStudyBaseProps'
import { StudyMode } from '@interfaces/common/Types'

/** Remix 학습 엔진(RemixStudyContainer) 전용 헤더 props */
export type HeaderRemixStudyProps = HeaderStudyBaseProps & {
  engine: 'remix'
  quizInfo: { mode: StudyMode }
  onModeChange: (mode: StudyMode) => void
  acquiredAugmentCount?: number
  onOpenAcquiredAugments?: () => void
  onSkipAct1?: () => void
  reviewCurrent?: number
  reviewTotal?: number
}
