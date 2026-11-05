import { forwardRef, type ImgHTMLAttributes } from 'react'

import chevLeftWhiteIcon from '@assets/icons/chev_left_white.svg'

export const IconChevLeftWhite = forwardRef<
  HTMLImageElement,
  ImgHTMLAttributes<HTMLImageElement>
>(function IconChevLeftWhite(props, ref) {
  const { alt = '', ...rest } = props
  return <img ref={ref} src={chevLeftWhiteIcon} alt={alt} {...rest} />
})
