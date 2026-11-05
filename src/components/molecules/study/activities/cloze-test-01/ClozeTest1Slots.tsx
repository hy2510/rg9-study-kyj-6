import { styled } from 'styled-components'

export const ClozeTest1BlankSlot = styled.span<{ $filled?: boolean }>`
  display: inline-block;
  line-height: 32px;
  min-width: ${(props) => (props.$filled ? 'auto' : '60px')};
  width: ${(props) => (props.$filled ? 'fit-content' : 'auto')};
  height: ${(props) => (props.$filled ? 'auto' : '32px')};
  padding: ${(props) => (props.$filled ? '0' : '0 4px')};
  margin: ${(props) => (props.$filled ? '0' : '0 2px')};
  border-radius: 10px;
  border: 1.5px solid ${(props) => (props.$filled ? 'none' : '#3c4b62')};
  background: ${(props) => (props.$filled ? 'transparent' : '#fff')};
  color: ${(props) => (props.$filled ? '#199261' : 'inherit')};
`

export const ClozeTest1SentenceText = styled.span`
  display: inline;
  font-size: 1.1em;
  font-weight: 500;
  color: #3c4b62;
  line-height: 32px;
  text-align: left;
`
