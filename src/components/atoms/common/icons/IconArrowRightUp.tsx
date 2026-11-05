import arrowRightUpIcon from '@assets/icons/arrow-right-up.svg'
import type { ImgIconProps } from '@interfaces/common/icons/ImgIconProps'
import { imgProps } from '@utils/common/icons/imgProps'

export function IconArrowRightUp({ width, height, ...rest }: ImgIconProps) {
  return <img src={arrowRightUpIcon} {...imgProps(width, height, rest)} />
}
