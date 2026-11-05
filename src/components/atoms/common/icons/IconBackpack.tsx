import backpackIcon from '@assets/icons/study/remix/icon_backpack.png'
import type { ImgIconProps } from '@interfaces/common/icons/ImgIconProps'
import { imgProps } from '@utils/common/icons/imgProps'

export function IconBackpack({ width, height, ...rest }: ImgIconProps) {
  return <img src={backpackIcon} {...imgProps(width, height, rest)} />
}
