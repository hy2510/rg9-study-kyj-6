import type { ReactNode } from 'react'

import TwoColumnGrid from '@components/atoms/study/layout/TwoColumnGrid'

type TwoColumnCardsProps = {
  children: ReactNode
}

export default function TwoColumnCards({ children }: TwoColumnCardsProps) {
  return <TwoColumnGrid>{children}</TwoColumnGrid>
}
