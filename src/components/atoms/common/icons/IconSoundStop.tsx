import soundStopIcon from '@assets/icons/sound-stop.svg'
import type { ImgIconProps } from '@interfaces/common/icons/ImgIconProps'
import { imgProps } from '@utils/common/icons/imgProps'

export function IconSoundStop({ width, height, ...rest }: ImgIconProps) {
  return <img src={soundStopIcon} {...imgProps(width, height, rest)} />
}
