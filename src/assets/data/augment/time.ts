import {
  commonCheckAugmentByCategoryAndTier,
  commonCheckIsCurrentTimeLow,
  commonCheckIsFirstStage,
  commonCheckIsLastStage,
  commonCheckIsTimeExceeded,
} from '@assets/data/augment/common'
import { IAugment } from '@hooks/study/remix/useAugmentManager'

export const timeAugments: IAugment[] = [
  {
    category: 'time',
    tier: 'silver',
    id: "Dodo's Magic Clock",
    nameKor: '도도의 마술 시계',
    nameEng: "Dodo's Magic Clock",
    descriptionKor: '도도가 마술 시계를 사용했어요. 시간이 3분 연장되요.',
    descriptionEng:
      'Dodo used the magic clock. The time is extended by 3 minutes.',
    conditions: {
      /**
       * 조건
       * 1. titanium tier time augment가 선택되어 있으면 모든 time 증강 제외
       * 2. 첫 스테이지가 아니어야 함( 시간이 소모되어 있어야 등장 가능 )
       */
      customCheck: (context) => {
        return (
          !commonCheckAugmentByCategoryAndTier(context, 'time', 'titanium') &&
          !commonCheckIsFirstStage(context) &&
          commonCheckIsTimeExceeded(context, 180)
        )
      },
    },
  },
  {
    category: 'time',
    tier: 'titanium',
    id: "Edmond's Secret Garden",
    nameKor: '에드몽의 비밀 정원',
    nameEng: "Edmond's Secret Garden",
    descriptionKor: '에드몽의 비밀 정원에 초대받았어요! 시간이 느리게 흘러요.',
    descriptionEng:
      'Edmond invited you to his secret garden! The time is flowing slowly.',
    conditions: {
      /**
       * 조건
       * 1. 스테이지 1에서만 등장이 가능함.
       * 2. 이 증강을 먹게 되면 추후에 time관련 증강이 등장하면 안됨
       */
      customCheck: (context) => {
        return commonCheckIsFirstStage(context)
      },
    },
  },
  {
    category: 'time',
    tier: 'titanium',
    id: "Millo's Time Machine",
    nameKor: '밀로의 타임 머신',
    nameEng: "Millo's Time Machine",
    descriptionKor:
      '밀로가 타임 머신 개발에 성공했어요! 과거의 시간으로 되돌아가요.',
    descriptionEng:
      'Millo has developed the time machine! The time is reset to the past.',
    conditions: {
      /**
       * 조건
       * 1. 이미 titanium tier time augment가 선택되어 있으면 제외
       * 2. 다음이 마지막 스테이지이고 남은 시간이 3분 이하여야 나올 수 있음
       */
      customCheck: (context) => {
        return (
          !commonCheckAugmentByCategoryAndTier(context, 'time', 'titanium') &&
          commonCheckIsLastStage(context) &&
          commonCheckIsCurrentTimeLow(context, 180)
        )
      },
    },
  },
]
