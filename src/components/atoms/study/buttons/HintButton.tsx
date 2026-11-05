import { styled } from 'styled-components'

export const HintButtonWrap = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 8px 0 4px;
  flex: 0 0 auto;
`

export const HintButton = styled.button`
  min-width: 120px;
  padding: 10px 20px;
  border-radius: 999px;
  border: 1.5px solid #e9edf3;
  background-color: #ffffff;
  color: #a2b1c4;
  font-family: 'Rg-B', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.05s ease;

  &:active:not(:disabled) {
    transform: translateY(1px);
  }
  &:disabled {
    color: #a2b1c4;
    cursor: not-allowed;
    background-color: #f5f7fa;
  }
`
