import keyboardSimpleIcon from '@assets/icons/keyboard-simple.svg'
import type { ImgIconProps } from '@interfaces/common/icons/ImgIconProps'
import { imgProps } from '@utils/common/icons/imgProps'

export function IconKeyboardSimple({ width, height, ...rest }: ImgIconProps) {
  return <img src={keyboardSimpleIcon} {...imgProps(width, height, rest)} />
}
