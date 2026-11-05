import { media } from '@styles/tokens/breakpoints'
import type { ReactNode } from 'react'
import styled from 'styled-components'

type FlexWrapCenterProps = {
  children: ReactNode
}

export default function FlexWrapCenter({ children }: FlexWrapCenterProps) {
  return <Wrap>{children}</Wrap>
}

const Wrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  align-items: center;

  ${media.mobile} {
    gap: 8px;

    > * {
      min-width: 0;
      width: 100%;
    }
  }
`
