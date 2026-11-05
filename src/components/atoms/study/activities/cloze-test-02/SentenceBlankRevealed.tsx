import styled from 'styled-components'

/**
 * 패널티 비활성 & 오답 소진 시 자동 공개된 정답 텍스트를 렌더한다.
 * 유저가 맞춘 blank(초록, SentenceBlankFilled) 와 시각적으로 구분되도록
 * 빨강 계열로 표시한다.
 */
export const SentenceBlankRevealed = styled.span`
  display: inline;
  color: #ef3d2e;
  font-weight: 700;
  margin: 0 1px;
`
