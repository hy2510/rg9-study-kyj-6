import styled from 'styled-components'

export const NextQuestionButton = styled.button<{ $marginBottom?: number }>`
  margin-top: 8px;
  margin-bottom: ${({ $marginBottom = 40 }) => $marginBottom}px;
  align-self: flex-end;
  padding: 12px 20px;
  font-family: 'Rg-B', sans-serif;
  font-size: 0.875rem;
  font-weight: 700;
  color: #fff;
  background-color: #20ad75;
  border: none;
  border-radius: 100px;
  cursor: pointer;

  &:active {
    transform: translateY(1px);
  }
`

export const NextQuestionButtonWrap = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  padding-top: 8px;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0 16px;
`
