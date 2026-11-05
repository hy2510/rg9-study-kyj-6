import keyboardFullIcon from '@assets/icons/keyboard-full.svg'
import type { ImgIconProps } from '@interfaces/common/icons/ImgIconProps'
import { imgProps } from '@utils/common/icons/imgProps'

export function IconKeyboardFull({ width, height, ...rest }: ImgIconProps) {
  return <img src={keyboardFullIcon} {...imgProps(width, height, rest)} />
}
