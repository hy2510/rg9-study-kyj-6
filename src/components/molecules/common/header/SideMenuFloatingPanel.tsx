import { slideInFromRight } from '@styles/tokens/animations'
import styled from 'styled-components'

const SideMenuFloatingPanel = styled.aside`
  position: fixed;
  top: 23px;
  right: 15px;
  bottom: 12px;
  width: min(300px, calc(100vw - 90px));
  z-index: 160;
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: #fff;
  border-radius: 30px;
  border: 1px solid #e5e7eb;
  animation: ${slideInFromRight} 0.22s ease both;
  padding: 30px;
`

export default SideMenuFloatingPanel
