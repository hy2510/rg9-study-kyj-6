import styled from 'styled-components'

import type { LegacyQuizMark } from '@interfaces/common/header/LegacyQuizMark'

import { ActivityResultMark } from './ActivityResultMark'

/**
 * 사내 정책 — 한 문제당 시도 가능 횟수는 최대 3번.
 * 실제 표 컬럼 수는 활동의 `stepProgress.quizAnswerCount` 에 맞춰 1 ~ 3 으로 조정된다.
 */
export const ATTEMPT_COLUMNS_HARD_CAP = 3
export const ATTEMPT_COLUMN_LABELS = ['1st', '2nd', '3rd'] as const

/**
 * 시도 기록 표 — Q 번호 × 1~3 시도 컬럼으로 O/X/- 마크를 노출한다.
 */
export function ActivityResultAttemptsTable({
  attempts,
  attemptColumns,
}: {
  attempts: LegacyQuizMark[][]
  attemptColumns: number
}) {
  return (
    <TableScroll>
      <Table>
        <thead>
          <tr>
            <Th $width={72}>#</Th>
            {Array.from({ length: attemptColumns }).map((_, i) => (
              <Th key={i}>{ATTEMPT_COLUMN_LABELS[i]}</Th>
            ))}
          </tr>
        </thead>
        <tbody>
          {attempts.map((row, rowIdx) => (
            <tr key={rowIdx}>
              <TdIndex>{`Q ${rowIdx + 1}`}</TdIndex>
              {Array.from({ length: attemptColumns }).map((_, colIdx) => (
                <TdCell key={colIdx}>
                  <ActivityResultMark mark={row[colIdx] ?? ''} />
                </TdCell>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </TableScroll>
  )
}

const TableScroll = styled.div`
  flex: 0 1 auto;
  min-height: 0;
  height: fit-content;
  overflow-y: auto;
  border: 1.5px solid #e9edf3;
  border-radius: 20px;
`

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-family: 'Rg-B', sans-serif;

  thead th {
    position: sticky;
    top: 0;
    background-color: #fafbfd;
    z-index: 1;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }
`

const Th = styled.th<{ $width?: number }>`
  font-size: 0.85rem;
  font-weight: 600;
  color: #a2b1c4;
  padding: 10px 8px;
  border-bottom: 1.5px solid #e9edf3;
  text-align: center;
  ${(p) => (p.$width ? `width: ${p.$width}px;` : '')}
`

const TdIndex = styled.td`
  padding: 10px 8px;
  text-align: center;
  white-space: nowrap;
  font-size: 0.95rem;
  font-weight: 600;
  color: #3c4b62;
  border-bottom: 1.5px solid #e9edf3;
`

const TdCell = styled.td`
  padding: 8px;
  text-align: center;
  border-bottom: 1.5px solid #e9edf3;
`
