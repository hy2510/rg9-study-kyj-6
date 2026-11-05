import { media } from '@styles/tokens/breakpoints'
import type { ReactNode } from 'react'
import styled from 'styled-components'

type TwoColumnGridProps = {
  children: ReactNode
}

export default function TwoColumnGrid({ children }: TwoColumnGridProps) {
  return <Grid>{children}</Grid>
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  ${media.mobile} {
    grid-template-columns: minmax(0, 1fr);
    gap: 8px;
  }
`
