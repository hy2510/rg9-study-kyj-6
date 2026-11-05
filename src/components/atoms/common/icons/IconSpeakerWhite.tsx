import speakerWhiteIcon from '@assets/icons/speaker-white.svg'
import type { ImgIconProps } from '@interfaces/common/icons/ImgIconProps'
import { imgProps } from '@utils/common/icons/imgProps'

export function IconSpeakerWhite({ width, height, ...rest }: ImgIconProps) {
  return <img src={speakerWhiteIcon} {...imgProps(width, height, rest)} />
}
