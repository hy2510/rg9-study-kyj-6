import chevRightGrayIcon from '@assets/icons/chev_right_gray.svg'
import type { ImgIconProps } from '@interfaces/common/icons/ImgIconProps'
import { imgProps } from '@utils/common/icons/imgProps'

export function IconChevRightGray({
  width = 16,
  height = 16,
  ...rest
}: ImgIconProps) {
  return <img src={chevRightGrayIcon} {...imgProps(width, height, rest)} />
}
