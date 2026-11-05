import type { ReactNode } from 'react'
import styled from 'styled-components'

type SelectionCardsColumnProps = {
  children: ReactNode
}

export default function SelectionCardsColumn({
  children,
}: SelectionCardsColumnProps) {
  return <Wrap>{children}</Wrap>
}

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`
