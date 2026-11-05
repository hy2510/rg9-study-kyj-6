import { styled } from 'styled-components'

export const Divider = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
  gap: 12px;

  .line {
    width: 100%;
    height: 1px;
    border-bottom: 1px dashed #a2b1c4;
  }

  .arrow-up {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      display: block;
      width: 100%;
      height: 100%;
    }
  }
`
