import { media } from '@styles/tokens/breakpoints'
import styled from 'styled-components'

import { IconDeleteGray } from '@components/atoms/common/icons/IconDeleteGray'

type PopupLayoutProps = {
  onClose: () => void
  children: React.ReactNode
  backdropColor?: 'on' | 'off'
  /**
   * 우상단 닫기(✕) 버튼 숨김 여부.
   * - 결과 팝업처럼 "닫기" 가 곧 진행과 동일해서 모호한 화면에서 false 대신 true 사용.
   * - 기본값 false (기존 사용처 호환).
   */
  hideCloseButton?: boolean
  fitContent?: boolean
}

export default function PopupLayout({
  onClose,
  children,
  backdropColor = 'on',
  hideCloseButton = false,
  fitContent = false,
}: PopupLayoutProps) {
  return (
    <Backdrop backdropColor={backdropColor}>
      <PopupContainer
        $fitContent={fitContent}
        onClick={(e) => e.stopPropagation()}
      >
        <PopupBody $fitContent={fitContent}>
          {children}
          {!hideCloseButton && (
            <CloseButton type='button' onClick={onClose} aria-label='Close'>
              <IconDeleteGray alt='' width={30} height={30} />
            </CloseButton>
          )}
        </PopupBody>
      </PopupContainer>
    </Backdrop>
  )
}

const Backdrop = styled.div<{ backdropColor: 'on' | 'off' }>`
  position: fixed;
  inset: 0;
  z-index: 999;
  background-color: ${({ backdropColor }) =>
    backdropColor === 'on' ? 'rgb(0, 0, 0, 0.25)' : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateZ(0);
  isolation: isolate;

  ${media.mobile} {
    padding: 0 8px;
    box-sizing: border-box;
  }
`

const PopupContainer = styled.div<{ $fitContent?: boolean }>`
  background-color: rgb(255, 255, 255, 0.75);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  width: min(700px, calc(100vw - 32px));
  height: min(500px, calc(100vh - 32px));
  border-radius: 40px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: visible;
  padding: 20px;

  ${media.mobile} {
    width: 100%;
    height: ${({ $fitContent }) =>
      $fitContent ? 'fit-content' : 'min(560px, calc(100dvh - 16px))'};
    max-height: min(560px, calc(100dvh - 16px));
    border-radius: 28px;
    padding: 12px;
  }
`

const PopupBody = styled.div<{ $fitContent?: boolean }>`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: visible;
  background-color: #fff;
  border: 1px solid #e9edf3;
  border-radius: 30px;
  padding: 20px;
  position: relative;

  ${media.mobile} {
    border-radius: 24px;
    padding: 14px;
    ${({ $fitContent }) =>
      $fitContent &&
      `
        flex: 0 1 auto;
      `}
  }
`

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 1000;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
`
