import imageIcon from '@assets/icons/image-icon.svg'
import type { ImgIconProps } from '@interfaces/common/icons/ImgIconProps'
import { imgProps } from '@utils/common/icons/imgProps'

export function IconImage({ width, height, ...rest }: ImgIconProps) {
  return <img src={imageIcon} {...imgProps(width, height, rest)} />
}
