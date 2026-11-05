import { type ComponentPropsWithoutRef } from 'react'

import { glassWindowFlow } from '@styles/tokens/animations'
import styled, { css } from 'styled-components'

import glassWindowImage from '@assets/themes/00.common/images/glass-window.png'
import {
  quizSelectablePressedStyle,
  resolveQuizSelectableFeedback,
} from '@components/atoms/study/feedback/QuizSelectableFeedbackFoundation'

type CompletePopupButtonProps = {
  variant?: 'primary' | 'secondary'
} & ComponentPropsWithoutRef<'button'>

export default function CompletePopupButton({
  variant = 'primary',
  type = 'button',
  ...rest
}: CompletePopupButtonProps) {
  return (
    <ButtonStyled type={type} $variant={variant} {...rest} />
  )
}

const ButtonStyled = styled.button<{ $variant: 'primary' | 'secondary' }>`
  position: relative;
  width: 100%;
  height: 60px;
  border: ${({ $variant }) =>
    $variant === 'primary'
      ? '1.5px solid #1baa70'
      : resolveQuizSelectableFeedback({}).border};
  border-radius: 20px;
  ${({ $variant }) =>
    $variant === 'primary'
      ? css`
          background-color: #20ad75;

          &::before {
            content: '';
            position: absolute;
            inset: 0;
            background-image: url(${glassWindowImage});
            background-repeat: no-repeat;
            background-position: center;
            background-size: auto 130%;
            pointer-events: none;
            animation: ${glassWindowFlow} 3.4s cubic-bezier(0.34, 0, 0.2, 1)
              infinite;
          }
        `
      : css`
          background: ${resolveQuizSelectableFeedback({}).bg};
        `}
  color: ${({ $variant }) => ($variant === 'primary' ? '#fff' : '#A2B1C4')};
  cursor: pointer;
  font-family: 'Chiron GoRound TC', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  overflow: hidden;
  box-shadow: ${({ $variant }) =>
    $variant === 'primary'
      ? '0 3px 0 0 #158b5c'
      : resolveQuizSelectableFeedback({}).boxShadow};
  transform: translateY(0);
  transition: all 0.05s ease;

  &:not(:disabled):active {
    ${quizSelectablePressedStyle}
  }

  &:disabled,
  &[aria-disabled='true'] {
    opacity: 0.45;
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    &::before {
      animation: none;
    }
  }
`
