import type { ReactNode } from 'react'
import styled from 'styled-components'

type QuestionContentLayoutProps = {
  children: ReactNode
}

export default function QuestionContentLayout({
  children,
}: QuestionContentLayoutProps) {
  return <Wrap>{children}</Wrap>
}

const Wrap = styled.div`
  min-height: 120px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0 16px;
  margin-bottom: 16px;
`
