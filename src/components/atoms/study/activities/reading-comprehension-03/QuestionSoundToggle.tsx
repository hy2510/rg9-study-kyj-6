import styled from 'styled-components'

export const QuestionSoundToggle = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.05s ease;

  &:active {
    transform: translateY(1px);
  }
`
