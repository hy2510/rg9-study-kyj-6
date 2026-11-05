import { useState } from 'react'

import styled from 'styled-components'

import Divider from '@components/atoms/common/Divider'
import { IconBackpack } from '@components/atoms/common/icons/IconBackpack'
import { IconChevronDown } from '@components/atoms/common/icons/IconChevronDown'
import { IconChevronUp } from '@components/atoms/common/icons/IconChevronUp'
import SideMenuRow from '@components/atoms/common/sideMenu/SideMenuRow'
import Stack from '@components/atoms/common/Stack'
import type { HeaderRemixStudyProps } from '@interfaces/common/header/HeaderRemixStudyProps'

import StudyBottomNavSection from './StudyBottomNavSection'

type RemixStudyMenuSectionsProps = {
  studyProps: HeaderRemixStudyProps
  closeMenu: () => void
  onNavigateStoryStudy: () => void
  onExitStudy: () => void
}

/**
 * Remix 학습 엔진 사이드바.
 * - QuizAct 진행 카드 (Act1 / Act2)
 * - Remix 전용 액션 (Act1 건너뛰기, 획득 증강 가방)
 * - 공통 하단 내비게이션 (다시 읽기 / 나가기)
 */
export default function RemixStudyMenuSections({
  studyProps,
  closeMenu,
  onNavigateStoryStudy,
  onExitStudy,
}: RemixStudyMenuSectionsProps) {
  return (
    <Stack gap={18}>
      <RemixStudySessionSection studyProps={studyProps} />
      <RemixStudyExtraActionsSection
        studyProps={studyProps}
        closeMenu={closeMenu}
      />
      <Divider />
      <StudyBottomNavSection
        isBookTypePB={studyProps.isBookTypePB}
        onNavigateStoryStudy={onNavigateStoryStudy}
        onExitStudy={onExitStudy}
      />
    </Stack>
  )
}

type RemixStudySessionSectionProps = {
  studyProps: HeaderRemixStudyProps
}

function RemixStudySessionSection({
  studyProps,
}: RemixStudySessionSectionProps) {
  const [openCardIndex, setOpenCardIndex] = useState<number | null>(0)

  const toggleCard = (index: number) => {
    setOpenCardIndex((prev) => (prev === index ? null : index))
  }

  return (
    <Stack gap={12}>
      {[0, 1].map((cardIndex) => {
        const isOpen = openCardIndex === cardIndex
        return (
          <StudyCard key={cardIndex}>
            <StudyHead
              type='button'
              onClick={() => toggleCard(cardIndex)}
              aria-expanded={isOpen}
            >
              {studyProps.quizInfo.mode}
              {isOpen ? (
                <IconChevronUp width={16} height={16} alt='' />
              ) : (
                <IconChevronDown width={16} height={16} alt='' />
              )}
            </StudyHead>
            {isOpen && (
              <StudyTable>
                <tbody>
                  {Array.from({ length: studyProps.total }).map((_, i) => (
                    <tr key={i}>
                      <td>Q{i + 1}</td>
                      <td>{i < studyProps.progress ? 'O' : 'X'}</td>
                      <td></td>
                      <td></td>
                    </tr>
                  ))}
                </tbody>
              </StudyTable>
            )}
          </StudyCard>
        )
      })}
    </Stack>
  )
}

type RemixStudyExtraActionsSectionProps = {
  studyProps: HeaderRemixStudyProps
  closeMenu: () => void
}

function RemixStudyExtraActionsSection({
  studyProps,
  closeMenu,
}: RemixStudyExtraActionsSectionProps) {
  return (
    <Stack gap={20}>
      {studyProps.onSkipAct1 && (
        <SideMenuRow
          onClick={() => {
            closeMenu()
            studyProps.onSkipAct1?.()
          }}
        >
          Act1 건너뛰기
        </SideMenuRow>
      )}
      {(studyProps.acquiredAugmentCount ?? 0) > 0 &&
        studyProps.onOpenAcquiredAugments && (
          <SideMenuRow
            onClick={() => {
              closeMenu()
              studyProps.onOpenAcquiredAugments?.()
            }}
          >
            <IconBackpack style={{ width: 18, height: 18 }} alt='' />(
            {studyProps.acquiredAugmentCount})
          </SideMenuRow>
        )}
    </Stack>
  )
}

const StudyCard = styled.div`
  border: 1px solid #e9edf3;
  border-radius: 14px;
  overflow: hidden;
`

const StudyHead = styled.button`
  width: 100%;
  display: flex;
  justify-content: space-between;
  border: none;
  background: rgba(233, 237, 243, 0.5);
  padding: 12px 14px;
  font-family: 'Rg-B', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: #1f2937;
  -webkit-text-fill-color: #1f2937;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
`

const StudyTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;

  tbody {
    tr {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;

      td {
        font-family: 'Rg-B', sans-serif;
        font-size: 0.9em;
        text-align: center;
        padding: 8px 10px;
        border-top: 1.5px solid #e9edf3;

        &:first-child {
          color: #a2b1c4;
        }
      }
    }
  }
`
