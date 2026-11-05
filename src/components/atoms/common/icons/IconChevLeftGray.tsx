import chevLeftGrayIcon from '@assets/icons/chev_left_gray.svg'
import type { ImgIconProps } from '@interfaces/common/icons/ImgIconProps'
import { imgProps } from '@utils/common/icons/imgProps'

export function IconChevLeftGray({
  width = 16,
  height = 16,
  ...rest
}: ImgIconProps) {
  return <img src={chevLeftGrayIcon} {...imgProps(width, height, rest)} />
}
