import micWhiteIcon from '@assets/icons/mic-white.svg'
import type { ImgIconProps } from '@interfaces/common/icons/ImgIconProps'
import { imgProps } from '@utils/common/icons/imgProps'

export function IconMicWhite({ width, height, ...rest }: ImgIconProps) {
  return <img src={micWhiteIcon} {...imgProps(width, height, rest)} />
}
