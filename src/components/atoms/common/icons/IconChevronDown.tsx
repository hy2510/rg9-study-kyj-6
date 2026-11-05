import chevronDownIcon from '@assets/icons/chevron-down.svg'
import type { ImgIconProps } from '@interfaces/common/icons/ImgIconProps'
import { imgProps } from '@utils/common/icons/imgProps'

export function IconChevronDown({
  width = 16,
  height = 16,
  ...rest
}: ImgIconProps) {
  return <img src={chevronDownIcon} {...imgProps(width, height, rest)} />
}
