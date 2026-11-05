import styled from 'styled-components'

import { IconDelete } from '@components/atoms/common/icons/IconDelete'

type MoviePopupProps = {
  url: string
  onClose: () => void
}

export default function MoviePopup({ url, onClose }: MoviePopupProps) {
  return (
    <Backdrop onClick={onClose}>
      <Container onClick={(e) => e.stopPropagation()}>
        <CloseButton type='button' onClick={onClose} aria-label='닫기'>
          <IconDelete alt='' width={30} height={30} />
        </CloseButton>
        <VideoLayer src={url} controls controlsList='nodownload' autoPlay />
      </Container>
    </Backdrop>
  )
}

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 999;
  background-color: #000;
  -webkit-backdrop-filter: blur(5px);
  backdrop-filter: blur(5px);
`

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
`

const VideoLayer = styled.video`
  display: block;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
`

const CloseButton = styled.button`
  position: absolute;
  top: max(12px, env(safe-area-inset-top, 0px));
  right: max(12px, env(safe-area-inset-right, 0px));
  z-index: 10;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background-color: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  color: #fff;

  &:active {
    opacity: 0.85;
  }
`
