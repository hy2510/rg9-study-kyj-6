import menuIcon from '@assets/icons/menu.svg'
import type { ImgIconProps } from '@interfaces/common/icons/ImgIconProps'
import { imgProps } from '@utils/common/icons/imgProps'

export function IconMenu({ width, height, ...rest }: ImgIconProps) {
  return <img src={menuIcon} {...imgProps(width, height, rest)} />
}
