import heartBasicIcon from '@assets/icons/heart-basic.svg'
import type { ImgIconProps } from '@interfaces/common/icons/ImgIconProps'
import { imgProps } from '@utils/common/icons/imgProps'

export function IconHeartBasic({ width, height, ...rest }: ImgIconProps) {
  return <img src={heartBasicIcon} {...imgProps(width, height, rest)} />
}
