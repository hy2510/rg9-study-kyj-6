import { useEffect, useState } from 'react'

import styled from 'styled-components'

import Divider from '@components/atoms/common/Divider'
import { IconChevronDown } from '@components/atoms/common/icons/IconChevronDown'
import { IconChevronUp } from '@components/atoms/common/icons/IconChevronUp'
import Stack from '@components/atoms/common/Stack'
import type { HeaderLegacyStudyProps } from '@interfaces/common/header/HeaderLegacyStudyProps'
import type { LegacyQuizMark } from '@interfaces/common/header/LegacyQuizMark'
import type { LegacyStepProgress } from '@interfaces/common/header/LegacyStepProgress'
import { formatActivityLabel } from '@utils/study/formatActivityLabel'

import StudyBottomNavSection from './StudyBottomNavSection'

const ATTEMPT_COLUMN_LABELS = ['1st', '2nd', '3rd'] as const

type LegacyStudyMenuSectionsProps = {
  studyProps: HeaderLegacyStudyProps
  onNavigateStoryStudy: () => void
  onExitStudy: () => void
  closeMenu: () => void
}

/**
 * Legacy 학습 엔진 사이드바.
 * - openSteps 갯수만큼 "Activity {stepId}" 카드를 렌더링
 * - 카드 안에는 Q1~Q{quizCount} 행을 그리고, 각 행은 시도 횟수(quizAnswerCount)
 *   만큼의 칸으로 나누어 시도별 'O' / 'X' / 공백 을 표시
 *   (예: 기회 3번에서 두번째에 정답이면 → X O 공백)
 * - 공통 하단 내비게이션 (다시 읽기 / 나가기)
 *
 * Remix 전용 액션(Act1 건너뛰기, 획득 증강 가방)은 노출하지 않는다.
 */
export default function LegacyStudyMenuSections({
  studyProps,
  onNavigateStoryStudy,
  onExitStudy,
  closeMenu,
}: LegacyStudyMenuSectionsProps) {
  const handleOpenVocaCards = () => {
    studyProps.onOpenVocaCards?.()
    closeMenu()
  }

  return (
    <Stack gap={18}>
      <LegacyStudyProgressSection
        studyProps={studyProps}
        closeMenu={closeMenu}
      />
      <Divider />
      <StudyBottomNavSection
        isBookTypePB={studyProps.isBookTypePB}
        onNavigateStoryStudy={onNavigateStoryStudy}
        onExitStudy={onExitStudy}
        showVocaCardsMenu={studyProps.showVocaCardsMenu}
        onOpenVocaCards={handleOpenVocaCards}
      />
    </Stack>
  )
}

type LegacyStudyProgressSectionProps = {
  studyProps: HeaderLegacyStudyProps
  closeMenu: () => void
}

/**
 * 진행 카드 묶음.
 * - 카드 한 개 = openSteps 의 한 step
 * - 한 번에 하나의 카드만 펼침 (Remix `RemixStudyMenuSections` 와 동일 인터랙션)
 * - 기본 펼침 인덱스는 현재 step 의 카드
 */
function LegacyStudyProgressSection({
  studyProps,
  closeMenu,
}: LegacyStudyProgressSectionProps) {
  const {
    openSteps,
    currentStepId,
    stepProgressMap,
    mappedStepActivity,
    onNavigateStep,
  } = studyProps

  const initialOpenIdx = Math.max(
    0,
    openSteps.findIndex((stepId) => stepId === currentStepId),
  )
  const [openCardIndex, setOpenCardIndex] = useState<number>(initialOpenIdx)

  /** currentStepId 변경 시 그 step 으로 펼침 카드 동기화 */
  useEffect(() => {
    const idx = openSteps.findIndex((stepId) => stepId === currentStepId)
    if (idx >= 0) setOpenCardIndex(idx)
  }, [currentStepId, openSteps])

  const toggleCard = (idx: number) => {
    setOpenCardIndex((prev) => (prev === idx ? -1 : idx))
  }

  /**
   * 스텝 카드 헤더 클릭.
   * - navigate 가능(리뷰/스태프/프리뷰) & 현재 스텝이 아님 → 해당 스텝으로 이동 + 메뉴 닫기
   * - 그 외 (학생 모드 or 현재 스텝) → 기존대로 카드 접기·펼치기
   */
  const handleHeadClick = (stepId: number, cardIndex: number) => {
    if (onNavigateStep && stepId !== currentStepId) {
      onNavigateStep(stepId)
      closeMenu()
      return
    }
    toggleCard(cardIndex)
  }

  return (
    <Stack gap={12}>
      {openSteps.map((stepId, cardIndex) => {
        const isOpen = openCardIndex === cardIndex
        const progress = stepProgressMap[stepId]
        const activityLabel = formatActivityLabel(
          mappedStepActivity[stepId - 1] ?? '',
        )

        const isCurrent = stepId === currentStepId

        return (
          <StudyCard key={stepId} $isCurrent={isCurrent}>
            <StudyHead
              type='button'
              onClick={() => handleHeadClick(stepId, cardIndex)}
              aria-expanded={isOpen}
              $isCurrent={isCurrent}
              $isOpen={isOpen}
            >
              <StudyHeadLabel>
                {activityLabel}
              </StudyHeadLabel>
              {isOpen ? (
                <IconChevronUp width={16} height={16} alt='' />
              ) : (
                <IconChevronDown width={16} height={16} alt='' />
              )}
            </StudyHead>
            {isOpen && <StudyBody progress={progress} />}
          </StudyCard>
        )
      })}
    </Stack>
  )
}

type StudyBodyProps = {
  progress: LegacyStepProgress | undefined
}

/**
 * 한 step 의 시도별 정·오답 표시.
 *
 * - progress 없음 / quizCount === 0 (prefetch 미완료, Quiz 배열 없는 활동):
 *   placeholder 한 줄
 * - 그 외: Q1 ~ Q{quizCount} 행을 그리고, 각 행은 시도 횟수(quizAnswerCount)
 *   만큼의 칸으로 구성. 각 칸에는 attempts[quizIdx][attemptIdx] 의
 *   'O' / 'X' / '' 를 그대로 표시한다.
 */
function StudyBody({ progress }: StudyBodyProps) {
  const quizCount = progress?.quizCount ?? 0
  const quizAnswerCount = progress?.quizAnswerCount ?? 0
  const attempts = progress?.attempts ?? []

  if (quizCount <= 0 || quizAnswerCount <= 0) {
    return (
      <StudyTable $attemptCount={1}>
        <tbody>
          <tr>
            <td>-</td>
            <td>-</td>
          </tr>
        </tbody>
      </StudyTable>
    )
  }

  return (
    <StudyTable $attemptCount={quizAnswerCount}>
      <thead>
        <tr>
          <th>#</th>
          {Array.from({ length: quizAnswerCount }).map((_, i) => (
            <th key={i}>{ATTEMPT_COLUMN_LABELS[i] ?? `${i + 1}`}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: quizCount }).map((_, qi) => {
          const row = attempts[qi] ?? []
          return (
            <tr key={qi}>
              <td>{`Q ${qi + 1}`}</td>
              {Array.from({ length: quizAnswerCount }).map((_, ai) => (
                <td key={ai}>
                  <Mark mark={row[ai] ?? ''} />
                </td>
              ))}
            </tr>
          )
        })}
      </tbody>
    </StudyTable>
  )
}

function Mark({ mark }: { mark: LegacyQuizMark | '' }) {
  if (mark === 'O') return <MarkText $variant='correct'>O</MarkText>
  if (mark === 'X') return <MarkText $variant='incorrect'>X</MarkText>
  return null
}

const StudyCard = styled.div<{ $isCurrent: boolean }>`
  border: 1.5px solid ${({ $isCurrent }) => ($isCurrent ? '#3c4b62' : '#e9edf3')};
  border-radius: 20px;
  overflow: hidden;
`

const StudyHead = styled.button<{ $isCurrent: boolean; $isOpen: boolean }>`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  border: none;
  border-bottom: ${({ $isCurrent, $isOpen }) =>
    !$isCurrent && $isOpen ? '1.5px solid #dfe5ed' : 'none'};
  background: ${({ $isCurrent }) =>
    $isCurrent ? '#3c4b62' : 'rgba(233, 237, 243, 0.5)'};
  padding: 12px 14px;
  font-family: 'Rg-B', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: ${({ $isCurrent }) => ($isCurrent ? '#fff' : '#a2b1c4')};
  cursor: pointer;

  img {
    filter: ${({ $isCurrent }) =>
      $isCurrent
        ? 'brightness(0) invert(1)'
        : 'brightness(0) saturate(100%) invert(73%) sepia(8%) saturate(431%) hue-rotate(176deg) brightness(94%) contrast(85%)'};
  }
`

const StudyHeadLabel = styled.span`
  min-width: 0;
  text-align: left;
  line-height: 1.35;
`

const StudyTable = styled.table<{ $attemptCount: number }>`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;

  thead,
  tbody {
    tr {
      display: grid;
      grid-template-columns: ${({ $attemptCount }) =>
        `60px ${'1fr '.repeat($attemptCount).trim()}`};

      th,
      td {
        font-family: 'Rg-B', sans-serif;
        font-size: 0.9em;
        text-align: center;
        padding: 8px 10px;
        min-height: 1em;
      }

      th {
        font-weight: 600;
        color: #a2b1c4;
        background-color: #fafbfd;
        border-bottom: 1.5px solid #e9edf3;
      }

      td {
        border-top: 1.5px solid #e9edf3;

        &:first-child {
          color: #a2b1c4;
        }
      }
    }
  }

  tbody tr:first-child td {
    border-top: none;
  }
`

const MarkText = styled.span<{ $variant: 'correct' | 'incorrect' }>`
  font-weight: 700;
  color: ${({ $variant }) =>
    $variant === 'correct' ? '#20ad75' : '#ef3d64'};
`
