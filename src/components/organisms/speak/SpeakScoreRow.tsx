import { media } from '@styles/tokens/breakpoints'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import type { LocalSpeakRecord } from '@interfaces/study/speak/ISpeak'
import { getSentenceDisplayTokens } from '@src/utils/speak/sentenceTokens'

const PASS_SCORE = 70

/**
 * Speak 결과 테이블의 한 행.
 * - 「건너뜀」 항목은 전체 Row 를 dim 처리 + 점수 자리에 "SKIPPED" 라벨.
 * - 그 외는 PASS_SCORE(70) 기준으로 점수 색상을 구분.
 */
export default function SpeakScoreRow({
  record,
  index,
}: {
  record: LocalSpeakRecord
  index: number
}) {
  const { t } = useTranslation()
  const score = Math.round(
    Number.isFinite(record.ScoreOverall) ? record.ScoreOverall : 0,
  )
  const isSkipped = !!record.isSkipped
  const isBelowPass = score < PASS_SCORE

  return (
    <Tr $isSkipped={isSkipped}>
      <TdIndex>{index + 1}</TdIndex>
      <TdSentence>
        <SentenceContent record={record} />
      </TdSentence>
      <TdScore>
        {isSkipped ? (
          <SkippedLabel>{t('speak.scoreSkipped')}</SkippedLabel>
        ) : (
          <ScoreValue $isBelowPass={isBelowPass}>{score}</ScoreValue>
        )}
      </TdScore>
    </Tr>
  )
}

/**
 * 문장 렌더러.
 * - Skip 항목: 원문 그대로 노출 (색상 없음, 부모 Tr 이 dim 처리).
 * - `matchedWordIndexes` 존재: 단어별 매칭/미매칭 색상 구분.
 * - 그 외: 원문 그대로 노출.
 */
function SentenceContent({ record }: { record: LocalSpeakRecord }) {
  const sentence = record.Sentence?.trim() ?? ''
  if (!sentence) return <>—</>

  if (record.isSkipped) return <>{sentence}</>

  const { matchedWordIndexes } = record
  if (!matchedWordIndexes) return <>{sentence}</>

  const matchedSet = new Set(matchedWordIndexes)
  const tokens = getSentenceDisplayTokens(sentence)

  return (
    <>
      {tokens.map((token, i) => {
        if (token.wordIndex === undefined)
          return <span key={i}>{token.text}</span>
        const isMatched = matchedSet.has(token.wordIndex)
        return (
          <SentenceWord key={i} $matched={isMatched}>
            {token.text}
          </SentenceWord>
        )
      })}
    </>
  )
}

const Tr = styled.tr<{ $isSkipped: boolean }>`
  ${({ $isSkipped }) => $isSkipped && 'opacity: 0.5;'}
`

const SkippedLabel = styled.span`
  font-family: 'Rg-B', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  color: #a2b1c4;
  text-transform: uppercase;
  letter-spacing: 0.02em;
`

const TdIndex = styled.td`
  padding: 10px 8px;
  text-align: center;
  font-size: 0.95rem;
  font-weight: 600;
  color: #3c4b62;
  border-bottom: 1px solid #f1f4f8;
  ${media.mobile} {
    font-size: 0.85rem;
    padding: 8px 4px;
  }
`

const TdSentence = styled.td`
  padding: 10px 8px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #3c4b62;
  border-bottom: 1px solid #f1f4f8;
  line-height: 1.6;
  ${media.mobile} {
    font-size: 0.85rem;
    padding: 8px 4px;
  }
`

const SentenceWord = styled.span<{ $matched: boolean }>`
  display: inline-block;
  padding: 0 3px;
  border-radius: 6px;
  color: ${(p) => (p.$matched ? '#199261' : '#c0392b')};
  background: ${(p) =>
    p.$matched ? 'rgba(211, 255, 188, 0.9)' : 'rgba(255, 220, 220, 0.7)'};
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
