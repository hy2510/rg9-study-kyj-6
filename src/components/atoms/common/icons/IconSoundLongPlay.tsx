import soundPlayIcon from '@assets/icons/book-sound-play.svg'
import type { ImgIconProps } from '@interfaces/common/icons/ImgIconProps'
import { imgProps } from '@utils/common/icons/imgProps'

export function IconSoundLongPlay({ width, height, ...rest }: ImgIconProps) {
  return <img src={soundPlayIcon} {...imgProps(width, height, rest)} />
}
