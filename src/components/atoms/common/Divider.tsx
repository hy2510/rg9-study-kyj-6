import styled from 'styled-components'

type DividerProps = {
  orientation?: 'horizontal' | 'vertical'
  /** horizontal: 높이(px), vertical: 너비(px) — 기본 1 */
  thickness?: number
  className?: string
}

export default function Divider({
  orientation = 'horizontal',
  thickness = 1,
  className,
}: DividerProps) {
  return (
    <Line
      role='separator'
      aria-orientation={orientation === 'vertical' ? 'vertical' : 'horizontal'}
      $orientation={orientation}
      $thickness={thickness}
      className={className}
    />
  )
}

const Line = styled.div<{
  $orientation: 'horizontal' | 'vertical'
  $thickness: number
}>`
  flex-shrink: 0;
  background-color: #e9edf3;
  ${({ $orientation, $thickness }) =>
    $orientation === 'horizontal'
      ? `
    width: 100%;
    height: ${$thickness}px;
  `
      : `
    width: ${$thickness}px;
    align-self: stretch;
    min-height: 1em;
  `}
`
