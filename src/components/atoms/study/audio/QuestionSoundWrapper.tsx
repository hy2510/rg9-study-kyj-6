import { type ReactNode } from 'react'

import styled from 'styled-components'

import { QuestionSoundPlacement } from '@contexts/QuestionSoundSlotContext'

export function QuestionSoundWrapper({ children }: { children: ReactNode }) {
  return (
    <QuestionSoundPlacement fallback={<Wrap>{children}</Wrap>}>
      {children}
    </QuestionSoundPlacement>
  )
}

const Wrap = styled.div`
  position: absolute;
  top: -20px;
  left: -20px;
`
