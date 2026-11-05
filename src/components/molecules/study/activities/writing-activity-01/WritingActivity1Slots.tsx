import { media } from '@styles/tokens/breakpoints'
import { css, styled } from 'styled-components'

export const WritingActivity1SentenceRow = styled.span<{
  $isCorrect?: boolean
}>`
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ $isCorrect }) => ($isCorrect ? '0.3em' : '4px')};
  font-size: 1.1em;
  font-weight: 500;
  color: #3c4b62;
  line-height: 36px;
`

export const WritingActivity1FixedWord = styled.span`
  display: inline;
`

export const WritingActivity1SlotBox = styled.span<{
  $filled?: boolean
  $isNext?: boolean
  $isChecked?: boolean
  $isIncorrect?: boolean
  $clickable?: boolean
  $isCompleted?: boolean
  $draggable?: boolean
  $isDragging?: boolean
  $isDragOver?: boolean
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  cursor: ${(props) => {
    if (props.$draggable) return 'grab'
    if (props.$clickable) return 'pointer'
    return 'default'
  }};
  opacity: ${(props) => (props.$isDragging ? 0.55 : 1)};
  touch-action: ${(props) => (props.$draggable ? 'none' : 'auto')};
  transition:
    opacity 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  ${(props) => {
    const isClean = props.$isCompleted && !props.$isIncorrect
    if (isClean) {
      return css`
        min-width: auto;
        min-height: auto;
        padding: 0;
        margin: 0;
        border: none;
        border-radius: 0;
        background: transparent;
        font-weight: 500;
      `
    }
    const borderColor = props.$isDragOver
      ? '#20ad75'
      : props.$isNext && !props.$isIncorrect
        ? '#3c4b62'
        : 'rgba(233, 237, 243, 0.25)'
    const bgColor =
      props.$isIncorrect || props.$isNext || props.$isDragOver
        ? '#fff'
        : 'rgba(233, 237, 243, 0.25)'

    return css`
      min-width: 60px;
      min-height: 36px;
      padding: 4px 16px;
      margin: 0 2px;
      border-radius: 15px;
      background: ${bgColor};
      border: 1.5px solid ${borderColor};
      box-shadow: ${props.$isDragOver ? '0 0 0 2px rgba(32, 173, 117, 0.2)' : 'none'};
    `
  }}

  ${media.mobile} {
    ${({ $filled, $isCompleted, $isIncorrect }) => {
      const isClean = $isCompleted && !$isIncorrect
      if (isClean) {
        return css`
          padding: 0;
          margin: 0;
        `
      }
      return css`
        padding: 0px 8px;
        margin-bottom: 4px;

        ${
          $filled &&
          css`
            min-width: 0;
            width: fit-content;
            max-width: 100%;
            padding: 0px 8px;
          `
        }
      `
    }}
  }
`
