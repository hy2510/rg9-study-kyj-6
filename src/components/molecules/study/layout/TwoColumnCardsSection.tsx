import type { ReactNode } from 'react'
import styled from 'styled-components'

import TwoColumnCards from '@components/molecules/study/layout/TwoColumnCards'

type TwoColumnCardsSectionProps = {
  children: ReactNode
}

export default function TwoColumnCardsSection({
  children,
}: TwoColumnCardsSectionProps) {
  return (
    <Wrap>
      <TwoColumnCards>{children}</TwoColumnCards>
    </Wrap>
  )
}

const Wrap = styled.div`
  margin-bottom: 16px;
`
