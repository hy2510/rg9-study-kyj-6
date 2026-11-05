import { media } from '@styles/tokens/breakpoints'
import { styled } from 'styled-components'

export const Summary2SentenceText = styled.span`
  display: inline;
  font-size: 1.1em;
  font-family: 'Rg-R', 'Fredoka', sans-serif;
  color: #3c4b62;
  line-height: 32px;
  text-align: left;

  ${media.mobile} {
    line-height: 28px;
  }
`

export const Summary2BlankSlot = styled.span<{
  $filled?: boolean
  $isNext?: boolean
  $isCorrect?: boolean
}>`
  display: inline-block;
  text-align: center;
  line-height: 32px;
  min-width: ${(props) => (props.$filled ? 'auto' : '60px')};
  width: ${(props) => (props.$filled ? 'fit-content' : 'auto')};
  height: ${(props) => (props.$filled ? 'auto' : '32px')};
  padding: ${(props) => (props.$isNext ? '0 4px' : '0')};
  margin: ${(props) => (props.$isNext ? '0 2px' : '0')};
  border-radius: 10px;
  border: 1.5px solid
    ${(props) =>
      props.$isNext ? '#3c4b62' : props.$filled ? 'none' : '#e9edf3'};
  background: ${(props) =>
    props.$filled ? '#fff ' : props.$isNext ? '#fff ' : '#e9edf3 '};
  color: ${(props) =>
    props.$filled ? (props.$isCorrect ? '#6abf8a' : '#e07a7a') : 'inherit'};

  ${media.mobile} {
    line-height: 28px;
    min-width: ${(props) => (props.$filled ? '0' : '40px')};
    max-width: 100%;
    height: ${(props) => (props.$filled ? 'auto' : '28px')};
    padding: ${(props) => (props.$isNext ? '0 2px' : '0')};
    word-break: break-word;
  }
`
