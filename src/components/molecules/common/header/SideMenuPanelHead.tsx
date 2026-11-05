import styled from 'styled-components'

import { IconDeleteGray } from '@components/atoms/common/icons/IconDeleteGray'

type SideMenuPanelHeadProps = {
  bookTitle: string
  bookCode: string
  closeAriaLabel: string
  onClose: () => void
}

export default function SideMenuPanelHead({
  bookTitle,
  bookCode,
  closeAriaLabel,
  onClose,
}: SideMenuPanelHeadProps) {
  return (
    <PanelHead>
      <div>
        <BookTitle id='side-menu-title'>{bookTitle}</BookTitle>
        <BookCode>{bookCode}</BookCode>
      </div>
      <CloseButton type='button' onClick={onClose} aria-label={closeAriaLabel}>
        <IconDeleteGray width={24} height={24} alt='' />
      </CloseButton>
    </PanelHead>
  )
}

const PanelHead = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
`

const BookTitle = styled.div`
  margin: 0;
  font-family: 'RG-B', sans-serif;
  font-size: 1.18rem;
  font-weight: 800;
  color: #1f2937;
`

const BookCode = styled.div`
  margin: 6px 0 0;
  font-family: 'Rg-B', sans-serif;
  font-size: 0.95rem;
  color: #a2b1c4;
`

const CloseButton = styled.button`
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border: none;
  border-radius: 50%;
  padding: 0;
  position: absolute;
  right: -10px;
  top: -10px;
`
