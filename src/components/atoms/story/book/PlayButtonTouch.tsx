import { media } from '@styles/tokens/breakpoints'
import { styled } from 'styled-components'

/** 터치 레이아웃: 재생 버튼을 화면 기준 오른쪽 아래 floating */
const PlayButtonTouch = styled.button`
  position: absolute;
  right: max(8px, env(safe-area-inset-right));
  bottom: max(12px, env(safe-area-inset-bottom));
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 25;
  padding: 0;
  background-color: rgba(255, 255, 255, 0.5);
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.15s ease,
    opacity 0.15s ease;

  &:active {
    transform: scale(0.93);
    opacity: 0.88;
  }

  img,
  svg {
    display: block;
    width: 28px;
    height: 28px;
  }

  ${media.mobile} {
    background-color: transparent;

    img,
    svg {
      width: 32px;
      height: 32px;
    }
  }
`

export default PlayButtonTouch
