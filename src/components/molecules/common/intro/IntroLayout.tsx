import { glassWindowFlow } from '@styles/tokens/animations'
import { TEXT_SHADOW_DEFAULT } from '@styles/tokens/textShadow'
import styled, { css } from 'styled-components'

import glassWindowImage from '@assets/themes/00.common/images/glass-window.png'
import { quizSelectablePressedStyle } from '@components/atoms/study/feedback/QuizSelectableFeedbackFoundation'

export const IntroBackdrop = styled.div`
  position: absolute;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 24px 20px 32px;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  background: rgba(0, 0, 0, 0.25);
  transform: translateZ(0);
  isolation: isolate;
`

export const IntroColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 30px;
  width: min(100%, 420px);
  flex: 0 0 auto;
  margin: auto;
  text-align: center;
`

export const IntroTitle = styled.div`
  margin: 0;
  font-family: 'Rg-B', sans-serif;
  font-size: 2em;
  color: #fff;
  text-shadow: ${TEXT_SHADOW_DEFAULT};
`

export const IntroStartButton = styled.button`
  position: relative;
  width: 100%;
  max-width: 400px;
  height: 60px;
  border: 1.5px solid #1baa70;
  border-radius: 20px;
  margin-top: 4px;
  padding: 0;
  ${css`
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
      animation: ${glassWindowFlow} 3.4s cubic-bezier(0.34, 0, 0.2, 1) infinite;
    }
  `}
  color: #fff;
  cursor: pointer;
  font-family: 'Rg-B', sans-serif;
  font-size: 1.25em;
  font-weight: 600;
  overflow: hidden;
  box-shadow: 0 3px 0 0 #158b5c;
  transform: translateY(0);
  transition: all 0.05s ease;

  &:not(:disabled):active {
    ${quizSelectablePressedStyle}
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    &::before {
      animation: none;
    }
  }
`
