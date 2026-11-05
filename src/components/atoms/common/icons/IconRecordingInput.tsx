import recordingInputIcon from '@assets/icons/recording-input.svg'
import type { ImgIconProps } from '@interfaces/common/icons/ImgIconProps'
import { imgProps } from '@utils/common/icons/imgProps'

export function IconRecordingInput({ width, height, ...rest }: ImgIconProps) {
  return <img src={recordingInputIcon} {...imgProps(width, height, rest)} />
}
