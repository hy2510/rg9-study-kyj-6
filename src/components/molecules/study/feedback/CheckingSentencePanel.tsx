import type { ReactNode } from 'react'
import styled from 'styled-components'

type CheckingSentencePanelProps = {
  isCorrect?: boolean
  isIncorrect?: boolean
  children: ReactNode
}

export default function CheckingSentencePanel({
  isCorrect,
  isIncorrect,
  children,
}: CheckingSentencePanelProps) {
  return (
    <Wrap $isCorrect={isCorrect} $isIncorrect={isIncorrect}>
      {children}
    </Wrap>
  )
}

const Wrap = styled.div<{
  $isCorrect?: boolean
  $isIncorrect?: boolean
}>`
  min-height: 120px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 25px;
  border: 1.5px solid
    ${(props) =>
      props.$isCorrect
        ? '#1baa70'
        : props.$isIncorrect
          ? '#ef3d2e'
          : '#e9edf3'};
  background: ${(props) =>
    props.$isCorrect ? '#DDF2EA' : props.$isIncorrect ? '#EDE7EE' : '#fff'};
  transition: all 0.2s ease;
`
