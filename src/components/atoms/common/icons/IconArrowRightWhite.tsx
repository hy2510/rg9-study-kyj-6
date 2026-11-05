import arrowRightWhiteIcon from '@assets/icons/arrow-right-white.svg'
import type { ImgIconProps } from '@interfaces/common/icons/ImgIconProps'
import { imgProps } from '@utils/common/icons/imgProps'

export function IconArrowRightWhite({ width, height, ...rest }: ImgIconProps) {
  return <img src={arrowRightWhiteIcon} {...imgProps(width, height, rest)} />
}
