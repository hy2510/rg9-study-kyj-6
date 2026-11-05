import { media } from '@styles/tokens/breakpoints'
import type { ReactNode } from 'react'
import { css, styled } from 'styled-components'

import FlexWrapCenter from '@components/atoms/study/layout/FlexWrapCenter'

type LayoutMode = 'flex' | 'grid'
type GridColumns = number | string

type CardsWrapCenterProps = {
  children: ReactNode
  layout?: LayoutMode
  mobileLayout?: LayoutMode
  columns?: GridColumns
  mobileColumns?: GridColumns
}

function toTemplateColumns(columns: GridColumns): string {
  if (typeof columns === 'number') {
    return `repeat(${columns}, minmax(0, 1fr))`
  }
  return columns
}

export default function CardsWrapCenter({
  children,
  layout = 'flex',
  mobileLayout = layout,
  columns = 2,
  mobileColumns = columns,
}: CardsWrapCenterProps) {
  if (layout === 'flex' && mobileLayout === 'flex') {
    return <FlexWrapCenter>{children}</FlexWrapCenter>
  }

  return (
    <Wrap
      $layout={layout}
      $mobileLayout={mobileLayout}
      $columns={toTemplateColumns(columns)}
      $mobileColumns={toTemplateColumns(mobileColumns)}
    >
      {children}
    </Wrap>
  )
}

const flexStyle = css`
  display: flex;
  flex-wrap: wrap;
`

const gridStyle = (columns: string) => css`
  display: grid;
  grid-template-columns: ${columns};
  justify-content: center;
  justify-items: center;
  align-items: center;
  align-content: center;

  > *:last-child:nth-child(odd) {
    grid-column: 1 / -1;
    max-width: calc((100% - 8px) / 2);
  }
`

const Wrap = styled.div<{
  $layout: LayoutMode
  $mobileLayout: LayoutMode
  $columns: string
  $mobileColumns: string
}>`
  width: 100%;
  gap: 12px;
  justify-content: center;
  align-items: center;

  ${(p) => (p.$layout === 'grid' ? gridStyle(p.$columns) : flexStyle)}

  ${media.mobile} {
    gap: 8px;
    ${(p) =>
      p.$mobileLayout === 'grid'
        ? css`
            ${gridStyle(p.$mobileColumns)}

            > * {
              min-width: 0;
              width: 100%;
            }
          `
        : css`
            ${flexStyle}

            > * {
              min-width: 0;
              width: 100%;
            }
          `}
  }
`
