import { keyframes, styled } from 'styled-components'

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
`

export const CorrectAnswerBox = styled.div`
  margin-top: 16px;
  padding: 12px 16px;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 6px;
  animation: ${slideDown} 0.2s ease;

  .label {
    flex-shrink: 0;
    font-family: 'Rg-B', sans-serif;
    color: #a2b1c4;
  }
`
