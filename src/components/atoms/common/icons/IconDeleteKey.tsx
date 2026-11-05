import deleteKeyIcon from '@assets/icons/delete-key.svg'
import type { ImgIconProps } from '@interfaces/common/icons/ImgIconProps'
import { imgProps } from '@utils/common/icons/imgProps'

export function IconDeleteKey({ width, height, ...rest }: ImgIconProps) {
  return <img src={deleteKeyIcon} {...imgProps(width, height, rest)} />
}
