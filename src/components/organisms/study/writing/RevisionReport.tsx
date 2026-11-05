import { media } from '@styles/tokens/breakpoints'
import styled from 'styled-components'

type RevisionReportProps = {
  revisionImageTop?: string
  revisionImageBottom?: string
  comment?: string
}

/**
 * 재작성(Rewriting) 모드에서 상단에 노출되는 첨삭 리포트.
 * - 첨삭 이미지 최대 2장 + 선생님 코멘트를 세로로 나열
 * - 이미지 로드 실패 / 값이 없는 경우 해당 슬롯은 렌더링하지 않는다
 * - 스크롤 영역으로 감싸 긴 리포트도 재작성 영역을 밀어내지 않도록 처리
 */
export default function RevisionReport({
  revisionImageTop,
  revisionImageBottom,
  comment,
}: RevisionReportProps) {
  const hasAny = Boolean(revisionImageTop || revisionImageBottom || comment)
  if (!hasAny) return null

  return (
    <Wrapper>
      {revisionImageTop ? (
        <RevisionImage src={revisionImageTop} alt='' loading='lazy' />
      ) : null}
      {revisionImageBottom ? (
        <RevisionImage src={revisionImageBottom} alt='' loading='lazy' />
      ) : null}
      {comment ? <Comment>{comment}</Comment> : null}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  width: 100%;
  box-sizing: border-box;
  max-height: 40vh;
  overflow-y: auto;
  background-color: #fff;
  border: 1.5px solid #e9edf3;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  ${media.mobile} {
    padding: 14px;
    max-height: 35vh;
    border-radius: 16px;
  }
`

const RevisionImage = styled.img`
  width: 100%;
  height: auto;
  border-radius: 12px;
`

const Comment = styled.p`
  margin: 0;
  font-family: 'Rg-R', 'Fredoka', sans-serif;
  font-size: 15px;
  line-height: 1.5;
  color: #3c4b62;
  white-space: pre-wrap;
`
