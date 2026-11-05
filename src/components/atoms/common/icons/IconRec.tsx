import recIcon from '@assets/icons/icon_rec.svg'
import type { ImgIconProps } from '@interfaces/common/icons/ImgIconProps'
import { imgProps } from '@utils/common/icons/imgProps'

export function IconRec({ width, height, ...rest }: ImgIconProps) {
  return <img src={recIcon} {...imgProps(width, height, rest)} />
}
