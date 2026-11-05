import printGrayIcon from '@assets/icons/printer.svg'
import type { ImgIconProps } from '@interfaces/common/icons/ImgIconProps'
import { imgProps } from '@utils/common/icons/imgProps'

export function IconPrintGray({ width, height, ...rest }: ImgIconProps) {
  return <img src={printGrayIcon} {...imgProps(width, height, rest)} />
}
