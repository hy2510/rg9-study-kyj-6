import { type ComponentPropsWithoutRef, forwardRef } from 'react'

import styled from 'styled-components'

type SectionTitleProps = ComponentPropsWithoutRef<'div'>

const SectionTitle = forwardRef<HTMLDivElement, SectionTitleProps>(
  function SectionTitle(props, ref) {
    return <SectionTitleStyled ref={ref} {...props} />
  },
)

export default SectionTitle

const SectionTitleStyled = styled.div`
  font-family: 'Rg-B', sans-serif;
  font-size: 0.9em;
`
