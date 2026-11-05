import { media } from '@styles/tokens/breakpoints'
import { styled } from 'styled-components'

/**
 * Atom: 스펠링 한 글자 슬롯.
 * 고정 문자(공백·특수문자)는 min-width 축소 + border 없음.
 */
export const SpellingCharSlot = styled.span<{
  $isFixed?: boolean
  $isCorrect?: boolean
  $isIncorrect?: boolean
  $isPlaceholder?: boolean
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  flex-shrink: 0;
  height: 44px;
  color: ${(p) =>
    p.$isPlaceholder
      ? '#a2b1c4'
      : p.$isCorrect
        ? '#1baa70'
        : p.$isIncorrect
          ? '#ef3d2e'
          : '#3c4b62'};
  border-bottom: ${(p) =>
    p.$isFixed
      ? 'none'
      : `2px solid ${
          p.$isPlaceholder
            ? '#a2b1c4'
            : p.$isCorrect
              ? '#1baa70'
              : p.$isIncorrect
                ? '#ef3d2e'
                : '#a2b1c4'
        }`};
`
