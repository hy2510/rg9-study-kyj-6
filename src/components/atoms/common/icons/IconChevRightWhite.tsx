import { forwardRef, type ImgHTMLAttributes } from 'react'

import chevRightWhiteIcon from '@assets/icons/chev_right_white.svg'

export const IconChevRightWhite = forwardRef<
  HTMLImageElement,
  ImgHTMLAttributes<HTMLImageElement>
>(function IconChevRightWhite(props, ref) {
  const { alt = '', ...rest } = props
  return <img ref={ref} src={chevRightWhiteIcon} alt={alt} {...rest} />
})
