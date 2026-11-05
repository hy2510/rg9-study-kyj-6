import deleteIcon from '@assets/icons/delete.svg'
import type { ImgIconProps } from '@interfaces/common/icons/ImgIconProps'
import { imgProps } from '@utils/common/icons/imgProps'

export function IconDelete({ width, height, ...rest }: ImgIconProps) {
  return <img src={deleteIcon} {...imgProps(width, height, rest)} />
}
