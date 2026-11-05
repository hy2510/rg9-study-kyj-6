import speakerIcon from '@assets/icons/speaker.svg'
import type { ImgIconProps } from '@interfaces/common/icons/ImgIconProps'
import { imgProps } from '@utils/common/icons/imgProps'

export function IconSpeaker({ width, height, ...rest }: ImgIconProps) {
  return <img src={speakerIcon} {...imgProps(width, height, rest)} />
}
