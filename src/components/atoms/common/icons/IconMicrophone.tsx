import microphoneIcon from '@assets/icons/microphone.svg'
import type { ImgIconProps } from '@interfaces/common/icons/ImgIconProps'
import { imgProps } from '@utils/common/icons/imgProps'

export function IconMicrophone({ width, height, ...rest }: ImgIconProps) {
  return <img src={microphoneIcon} {...imgProps(width, height, rest)} />
}
