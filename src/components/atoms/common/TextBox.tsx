import { media } from '@styles/tokens/breakpoints'
import styled from 'styled-components'

type TextProps = {
  children: React.ReactNode
  fontSize?: number
  fontWeight?: number
  fontFamily?: string
  color?: string
  style?: React.CSSProperties
  className?: string
}

export default function TextBox({
  children,
  fontSize = 1,
  fontFamily = 'Rg-B',
  fontWeight = 500,
  color = 'primary',
  style,
  className,
}: TextProps) {
  return (
    <TextStyled
      $fontSize={fontSize}
      $fontWeight={fontWeight}
      $fontFamily={fontFamily}
      $color={color}
      style={style}
      className={className}
    >
      {children}
    </TextStyled>
  )
}

const TextStyled = styled.div<{
  $fontSize: number
  $fontWeight: number
  $color: string
  $fontFamily: string
}>`
  font-family: ${({ $fontFamily }) => $fontFamily}, system-ui,
    'PingFang SC', 'PingFang TC', 'Hiragino Sans', 'Yu Gothic UI',
    'Microsoft YaHei', 'Noto Sans CJK KR', 'Noto Sans CJK SC',
    'Noto Sans CJK JP', 'Chiron GoRound TC', sans-serif;
  font-size: ${({ $fontSize }) => ($fontSize ? $fontSize * 16 + 'px' : '16px')};
  font-weight: ${({ $fontWeight }) =>
    $fontWeight === 1
      ? '100'
      : $fontWeight === 2
        ? '200'
        : $fontWeight === 3
          ? '300'
          : $fontWeight === 4
            ? '400'
            : $fontWeight === 5
              ? '500'
              : $fontWeight === 6
                ? '600'
                : $fontWeight === 7
                  ? '700'
                  : $fontWeight === 8
                    ? '800'
                    : $fontWeight === 9
                      ? '900'
                      : '500'};
  color: ${({ $color }) =>
    $color === 'primary'
      ? '#3c4b62'
      : $color === 'secondary'
        ? '#a2b1c4'
        : $color};

  ${media.mobile} {
    font-size: ${({ $fontSize }) =>
      `max(12px, ${Math.round($fontSize * 16 * 0.85 * 100) / 100}px)`};
  }
`
