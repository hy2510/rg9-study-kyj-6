import { media } from '@styles/tokens/breakpoints'
import styled from 'styled-components'

const HeaderMenuButton = styled.button`
  cursor: pointer;
  width: 44px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 100px;
  background: rgb(255, 255, 255, 0.5);
  padding: 0;

  ${media.mobile} {
    width: 34px;
    height: 34px;

    img,
    svg {
      width: 16px;
      height: 16px;
    }
  }
`

export default HeaderMenuButton
