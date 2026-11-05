import clockBasicIcon from '@assets/icons/clock-basic.svg'
import type { ImgIconProps } from '@interfaces/common/icons/ImgIconProps'
import { imgProps } from '@utils/common/icons/imgProps'

export function IconClockBasic({ width, height, ...rest }: ImgIconProps) {
  return <img src={clockBasicIcon} {...imgProps(width, height, rest)} />
}
