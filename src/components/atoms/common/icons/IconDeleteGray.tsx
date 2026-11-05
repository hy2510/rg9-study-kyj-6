import deleteGrayIcon from '@assets/icons/delete-gray.svg'
import type { ImgIconProps } from '@interfaces/common/icons/ImgIconProps'
import { imgProps } from '@utils/common/icons/imgProps'

export function IconDeleteGray({ width, height, ...rest }: ImgIconProps) {
  return <img src={deleteGrayIcon} {...imgProps(width, height, rest)} />
}
