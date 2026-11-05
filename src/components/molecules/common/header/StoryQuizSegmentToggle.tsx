import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type StoryQuizSegmentToggleProps = {
  storySideActive: boolean
  quizSideActive: boolean
  onSelect: (target: 'story' | 'quiz') => void
}

export default function StoryQuizSegmentToggle({
  storySideActive,
  quizSideActive,
  onSelect,
}: StoryQuizSegmentToggleProps) {
  const { t } = useTranslation()

  return (
    <ToggleRoot role='group' aria-label={t('header.storyQuizToggleAria')}>
      <ToggleSegment
        type='button'
        $active={storySideActive}
        aria-pressed={storySideActive}
        onClick={() => onSelect('story')}
      >
        Story
      </ToggleSegment>
      <ToggleSegment
        type='button'
        $active={quizSideActive}
        aria-pressed={quizSideActive}
        onClick={() => onSelect('quiz')}
      >
        Quiz
      </ToggleSegment>
    </ToggleRoot>
  )
}

const ToggleRoot = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 4px;
  border-radius: 100px;
  background: rgb(255, 255, 255, 0.9);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
  gap: 2px;
`

const ToggleSegment = styled.button<{ $active: boolean }>`
  border: none;
  border-radius: 100px;
  padding: 0 12px;
  height: 32px;
  font-family: 'Rg-B', 'Chiron GoRound TC', sans-serif;
  font-size: 0.9em;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background 0.15s ease,
    color 0.15s ease;

  ${(p) =>
    p.$active
      ? `
    background: #E9EDF3;
    color: #3C4B62;
  `
      : `
    background: transparent;
    color: #A2B1C4;
  `}
`
