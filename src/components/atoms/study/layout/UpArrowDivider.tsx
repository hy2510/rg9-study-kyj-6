import { styled } from 'styled-components'

import { IconArrowUp } from '@components/atoms/common/icons/IconArrowUp'

export const UpArrowDividerWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
  gap: 12px;
  flex-shrink: 0;

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

export function UpArrowDivider() {
  return (
    <UpArrowDividerWrap>
      <div className='line' />
      <div className='arrow-up'>
        <IconArrowUp alt='arrow-up' />
      </div>
      <div className='line' />
    </UpArrowDividerWrap>
  )
}
