import chevronUpIcon from '@assets/icons/chevron-up.svg'
import type { ImgIconProps } from '@interfaces/common/icons/ImgIconProps'
import { imgProps } from '@utils/common/icons/imgProps'

export function IconChevronUp({
  width = 16,
  height = 16,
  ...rest
}: ImgIconProps) {
  return <img src={chevronUpIcon} {...imgProps(width, height, rest)} />
}
