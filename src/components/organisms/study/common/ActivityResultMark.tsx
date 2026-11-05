import styled from 'styled-components'

import type { LegacyQuizMark } from '@interfaces/common/header/LegacyQuizMark'

/**
 * 표 셀 마크 — 'O' / 'X' / '-' (빈 시도).
 */
export function ActivityResultMark({ mark }: { mark: LegacyQuizMark }) {
  if (mark === 'O') return <MarkBadge $variant='correct'>O</MarkBadge>
  if (mark === 'X') return <MarkBadge $variant='incorrect'>X</MarkBadge>
  return <MarkDash aria-hidden>-</MarkDash>
}

const MarkBadge = styled.span<{ $variant: 'correct' | 'incorrect' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 0.95rem;
  font-weight: 700;
  color: ${(p) => (p.$variant === 'correct' ? '#20ad75' : '#ef3d64')};
  /* background-color: ${(p) =>
    p.$variant === 'correct' ? '#20ad75' : '#ef3d64'}; */
`

const MarkDash = styled.span`
  display: inline-block;
  color: #c8d2df;
  font-size: 1rem;
  font-weight: 600;
`
