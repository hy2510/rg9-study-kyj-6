import { useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'

import { media } from '@styles/tokens/breakpoints'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import TextBox from '@components/atoms/common/TextBox'
import PopupLayout from '@components/molecules/common/PopupLayout'
import type { WordScoreSummaryItem } from '@interfaces/study/word-practice/wordPracticeScore'

const PASS_SCORE = 70

type WordPracticeScoreModalProps = {
  items: WordScoreSummaryItem[]
  onProceed: () => void
}

export default function WordPracticeScoreModal({
  items,
  onProceed,
}: WordPracticeScoreModalProps) {
  const { t } = useTranslation()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || event.repeat) return
      event.preventDefault()
      onProceed()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onProceed])

  const hasItems = items.length > 0

  return createPortal(
    <PopupLayout onClose={onProceed} hideCloseButton>
      <Container>
        <Header>
          <TextBox fontSize={1.6} fontWeight={7} color='primary'>
            {t('study.wordPracticeScoreTitle')}
          </TextBox>
          <Encouragement>{t('study.wordPracticeScoreEncouragement')}</Encouragement>
        </Header>

        <Body>
          {!hasItems ? (
            <EmptyState>
              <TextBox fontSize={1} color='secondary'>
                {t('study.wordPracticeScoreEmpty')}
              </TextBox>
            </EmptyState>
          ) : (
            <TableScroll>
              <Table>
                <thead>
                  <tr>
                    <Th $width={48}>#</Th>
                    <Th>{t('study.wordPracticeScoreWord')}</Th>
                    <Th>{t('study.wordPracticeScoreMeaning')}</Th>
                    <Th $width={88}>{t('study.wordPracticeScorePercent')}</Th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <WordScoreRow key={item.word} item={item} index={index} />
                  ))}
                </tbody>
              </Table>
            </TableScroll>
          )}
        </Body>

        <Footer>
          <ProceedButton type='button' onClick={onProceed}>
            {t('study.wordPracticeScoreFinish')}
          </ProceedButton>
        </Footer>
      </Container>
    </PopupLayout>,
    document.body,
  )
}

function WordScoreRow({ item, index }: { item: WordScoreSummaryItem; index: number }) {
  const isBelowPass = useMemo(() => item.score < PASS_SCORE, [item.score])

  return (
    <tr>
      <TdIndex>{index + 1}</TdIndex>
      <TdWord>{item.word}</TdWord>
      <TdMeaning>{item.meaning || '—'}</TdMeaning>
      <TdScore>
        <ScoreValue $isBelowPass={isBelowPass}>{item.score}</ScoreValue>
      </TdScore>
    </tr>
  )
}

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  gap: 16px;
  padding: 4px 8px 0;
  ${media.mobile} { gap: 12px; padding: 0; }
`

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Encouragement = styled.p`
  margin: 0;
  font-family: 'Rg-B', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
  color: #3c4b62;
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
  ${media.mobile} { font-size: 0.75rem; padding: 8px 4px; }
`

const TdIndex = styled.td`
  padding: 10px 8px;
  text-align: center;
  font-size: 0.95rem;
  font-weight: 600;
  color: #3c4b62;
  border-bottom: 1px solid #f1f4f8;
  ${media.mobile} { font-size: 0.85rem; padding: 8px 4px; }
`

const TdWord = styled.td`
  padding: 10px 8px;
  font-size: 0.95rem;
  font-weight: 700;
  color: #3c4b62;
  border-bottom: 1px solid #f1f4f8;
  ${media.mobile} { font-size: 0.85rem; padding: 8px 4px; }
`

const TdMeaning = styled.td`
  padding: 10px 8px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #6b7a8f;
  border-bottom: 1px solid #f1f4f8;
  ${media.mobile} { font-size: 0.8rem; padding: 8px 4px; }
`

const TdScore = styled.td`
  padding: 10px 8px;
  text-align: center;
  border-bottom: 1px solid #f1f4f8;
`

const ScoreValue = styled.span<{ $isBelowPass: boolean }>`
  font-family: 'Rg-B', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ $isBelowPass }) => ($isBelowPass ? '#ef3d2e' : '#20ad75')};
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
  font-family: 'Rg-B', sans-serif;
  font-size: 1.1em;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 3px 0 0 #1a1a1a;
  &:active { transform: translateY(2px); box-shadow: none; }
`
