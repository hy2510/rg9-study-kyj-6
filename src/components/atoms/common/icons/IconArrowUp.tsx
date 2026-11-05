import arrowUpIcon from '@assets/icons/arrow-up-gray.svg'
import type { ImgIconProps } from '@interfaces/common/icons/ImgIconProps'
import { imgProps } from '@utils/common/icons/imgProps'

export function IconArrowUp({ width, height, ...rest }: ImgIconProps) {
  return <img src={arrowUpIcon} {...imgProps(width, height, rest)} />
}
