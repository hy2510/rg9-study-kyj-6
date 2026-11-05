import { useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'

import { media } from '@styles/tokens/breakpoints'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import TextBox from '@components/atoms/common/TextBox'
import PopupLayout from '@components/molecules/common/PopupLayout'
import type { LocalSpeakRecord } from '@interfaces/study/speak/ISpeak'
import { computeSpeakAverageScore } from '@utils/speak/computeSpeakAverage'

import SpeakScoreRow from './SpeakScoreRow'

const PASS_SCORE = 70

type SpeakScoreModalProps = {
  records: LocalSpeakRecord[]
  onClose: () => void
}

/**
 * Speak 학습 결과 모달.
 * - 문장별 일치율(ScoreOverall) + 전체 평균을 테이블로 노출.
 * - 완료 여부와 무관하게 진행 중에도 열람 가능 (사이드 메뉴 「결과 보기」 진입).
 * - PASS_SCORE(70) 기준으로 색상 구분.
 */
export default function SpeakScoreModal({
  records,
  onClose,
}: SpeakScoreModalProps) {
  const { t } = useTranslation()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || event.repeat) return
      event.preventDefault()
      onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const hasRecords = records.length > 0

  // 평균 산정에 「건너뜀」 항목도 0 점으로 포함한다.
  const averageScore = useMemo(
    () => computeSpeakAverageScore(records),
    [records],
  )

  const isAverageBelowPass = averageScore < PASS_SCORE

  return createPortal(
    <PopupLayout onClose={onClose} hideCloseButton>
      <Container>
        <Header>
          <TextBox fontSize={1.6} fontWeight={7} color='primary'>
            {t('speak.scoreTitle')}
          </TextBox>
        </Header>

        <Body>
          {!hasRecords ? (
            <EmptyState>
              <TextBox fontSize={1} color='secondary'>
                {t('speak.scoreEmpty')}
              </TextBox>
            </EmptyState>
          ) : (
            <>
              <TableScroll>
                <Table>
                  <thead>
                    <tr>
                      <Th $width={48}>#</Th>
                      <Th>Sentence</Th>
                      <Th $width={88}>Score</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record, index) => (
                      <SpeakScoreRow
                        key={`${record.Page}-${record.Sequence}-${index}`}
                        record={record}
                        index={index}
                      />
                    ))}
                  </tbody>
                </Table>
              </TableScroll>
              <AverageBox>
                <AverageLabel>{t('speak.scoreAverage')}</AverageLabel>
                <AverageValue $isBelowPass={isAverageBelowPass}>
                  {averageScore}%
                </AverageValue>
              </AverageBox>
            </>
          )}
        </Body>

        <Footer>
          <ProceedButton type='button' onClick={onClose}>
            Finish
          </ProceedButton>
        </Footer>
      </Container>
    </PopupLayout>,
    document.body,
  )
}

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  gap: 16px;
  padding: 4px 8px 0;
  ${media.mobile} {
    gap: 12px;
    padding: 0;
  }
`

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const AverageBox = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 0 2px;
  border: none;
  background: transparent;
  width: fit-content;
  align-self: flex-end;
  margin-top: 12px;
  margin-right: 12px;
`

const AverageLabel = styled.span`
  font-family: 'Rg-B', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  color: #6b7a8f;
`

const AverageValue = styled.span<{ $isBelowPass: boolean }>`
  font-family: 'Rg-B', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ $isBelowPass }) => ($isBelowPass ? '#ef3d2e' : '#20ad75')};
`

const Body = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`

const TableScroll = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  border: 1px solid #e9edf3;
  border-radius: 15px;
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
`

const Th = styled.th<{ $width?: number }>`
  font-size: 0.85rem;
  font-weight: 600;
  color: #a2b1c4;
  padding: 10px 8px;
  border-bottom: 1px solid #e9edf3;
  text-align: center;
  ${({ $width }) => ($width ? `width: ${$width}px;` : '')}
  ${media.mobile} {
    font-size: 0.75rem;
    padding: 8px 4px;
  }
`

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
`

const ProceedButton = styled.button`
  height: 50px;
  width: 100%;
  padding: 0 20px;
  border-radius: 20px;
  border: 1.5px solid #3c4b62;
  background-color: #3c4b62;
  color: #fff;
  font-family: 'Rg-B', 'Fredoka', sans-serif;
  font-size: 1.1em;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 3px 0 0 #1a1a1a;
  &:active {
    transform: translateY(2px);
    box-shadow: none;
  }
`
