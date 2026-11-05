import {
  commonCheckAugmentByCategory,
  commonCheckIsBeforeLastStage,
} from '@assets/data/augment/common'
import { IAugment } from '@hooks/study/remix/useAugmentManager'

export const pointAugments: IAugment[] = [
  {
    category: 'point',
    tier: 'silver',
    id: 'Three-Leaf Clover',
    nameKor: '행운의 세 잎 클로버',
    nameEng: 'Three-Leaf Clover',
    descriptionKor: '행운의 세잎 클로버',
    descriptionEng: 'Three-Leaf Clover',
    conditions: {
      /**
       * 조건
       * 1. 마지막 스테이지 직전(다음 스테이지가 마지막인 시점)에만 등장할 수 있음
       */
      customCheck: (context) => {
        return (
          commonCheckIsBeforeLastStage(context) &&
          !commonCheckAugmentByCategory(context, 'point')
        )
      },
    },
  },
  {
    category: 'point',
    tier: 'gold',
    id: 'Four-Leaf Clover',
    nameKor: '행운의 네 잎 클로버',
    nameEng: 'Four-Leaf Clover',
    descriptionKor: '행운의 네 잎 클로버',
    descriptionEng: 'Four-Leaf Clover',
    conditions: {
      /**
       * 조건
       * 1. 마지막 스테이지 직전(다음 스테이지가 마지막인 시점)에만 등장할 수 있음
       */
      customCheck: (context) => {
        return (
          commonCheckIsBeforeLastStage(context) &&
          !commonCheckAugmentByCategory(context, 'point')
        )
      },
    },
  },
  {
    category: 'point',
    tier: 'emerald',
    id: 'Golden Clover',
    nameKor: '행운의 황금 클로버',
    nameEng: 'Golden Clover',
    descriptionKor: '행운의 황금 클로버',
    descriptionEng: 'Golden Clover',
    conditions: {
      /**
       * 조건
       * 1. 마지막 스테이지 직전(다음 스테이지가 마지막인 시점)에만 등장할 수 있음
       */
      customCheck: (context) => {
        return (
          commonCheckIsBeforeLastStage(context) &&
          !commonCheckAugmentByCategory(context, 'point')
        )
      },
    },
  },
  {
    category: 'point',
    tier: 'titanium',
    id: 'Special Fever Time!',
    nameKor: '스페셜 피버 타임!',
    nameEng: 'Special Fever Time!',
    descriptionKor:
      '스페셜 피버 타임!!! 지금부터 연속으로 맞춘 횟수에 따라 보너스 포인트가 부여됩니다.',
    descriptionEng:
      'Special Fever Time!!! The bonus point is granted based on the number of consecutive correct answers.',
  },
]
