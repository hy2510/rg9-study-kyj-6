import { type ComponentPropsWithoutRef, forwardRef } from 'react'

import styled from 'styled-components'

type StackProps = ComponentPropsWithoutRef<'div'> & {
  /** flex gap (px) */
  gap?: number
  /** flex-direction (default: 'column') */
  direction?: 'row' | 'column'
}

const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
  { gap = 0, direction = 'column', ...rest },
  ref,
) {
  return <StackStyled ref={ref} $gap={gap} $direction={direction} {...rest} />
})

export default Stack

const StackStyled = styled.div<{
  $gap: number
  $direction: 'row' | 'column'
}>`
  display: flex;
  flex-direction: ${(p) => p.$direction};
  gap: ${(p) => p.$gap}px;
`
