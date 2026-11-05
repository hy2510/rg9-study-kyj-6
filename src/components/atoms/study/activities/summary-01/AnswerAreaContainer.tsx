import { styled } from 'styled-components'

export const AnswerAreaContainer = styled.div<{ $isCompleted?: boolean }>`
  flex: 0 1 auto;
  max-height: ${(props) =>
    props.$isCompleted ? 'none' : 'clamp(120px, 32vh, 250px)'};
  display: flex;
  flex-direction: column;

  @supports (height: 1dvh) {
    max-height: ${(props) =>
      props.$isCompleted ? 'none' : 'clamp(120px, 32dvh, 250px)'};
  }
`
