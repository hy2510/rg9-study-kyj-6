import { audioAugments } from '@assets/data/augment/audio'
import { heartAugments } from '@assets/data/augment/heart'
import { imageAugments } from '@assets/data/augment/image'
import { keyboardAugments } from '@assets/data/augment/keyboard'
import { pointAugments } from '@assets/data/augment/point'
import { sentenceAugments } from '@assets/data/augment/sentence'
import { specialAugments } from '@assets/data/augment/special'
import { timeAugments } from '@assets/data/augment/time'
import { wordAugments } from '@assets/data/augment/word'
import { IAugment } from '@hooks/study/remix/useAugmentManager'

export const AugmentData: IAugment[] = [
  ...heartAugments,
  ...timeAugments,
  ...pointAugments,
  ...audioAugments,
  ...imageAugments,
  ...wordAugments,
  ...keyboardAugments,
  ...sentenceAugments,
  ...specialAugments,
]
