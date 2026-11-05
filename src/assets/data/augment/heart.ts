import { commonCheckAugmentByCategoryAndTier } from '@assets/data/augment/common'
import { AugmentContext, IAugment } from '@hooks/study/remix/useAugmentManager'

const canRecoverHeart = (context: AugmentContext, amount: number) => {
  return context.maxHeart - context.currentHeart >= amount
}

export const heartAugments: IAugment[] = [
  // Heart 관련
  {
    category: 'heart',
    tier: 'silver',
    id: "Sheila's Pancake",
    nameKor: '씰라의 팬 케이크',
    nameEng: "Sheila's Pancake",
    descriptionKor: '씰라의 갓 구운 팬케이크를 먹었어요. 하트 1개를 회복해요.',
    descriptionEng:
      "You ate Sheila's freshly baked pancake. It refill 1 heart.",
    allowReSelection: true,
    conditions: {
      customCheck: (context) => {
        return (
          !commonCheckAugmentByCategoryAndTier(context, 'heart', 'titanium') &&
          canRecoverHeart(context, 1)
        )
      },
    },
  },
  {
    category: 'heart',
    tier: 'gold',
    id: "Blanc's Bandage",
    nameKor: '블랑의 붕대',
    nameEng: "Blanc's Bandage",
    descriptionKor: '블랑이 붕대를 감아줬어요! 하트 2개를 회복해요.',
    descriptionEng: 'Blanc wrapped you in a bandage! It refills 2 hearts.',
    allowReSelection: true,
    conditions: {
      customCheck: (context) => {
        return (
          !commonCheckAugmentByCategoryAndTier(context, 'heart', 'titanium') &&
          canRecoverHeart(context, 2)
        )
      },
    },
  },
  {
    category: 'heart',
    tier: 'emerald',
    id: "Greenthumb's Magic Beans",
    nameKor: '그린썸의 마법 완두콩',
    nameEng: "Greenthumb's Magic Beans",
    descriptionKor: '그린썸의 마법 완두콩을 먹었어요! 하트를 3개 회복해요',
    descriptionEng: "You ate Greenthumb's magic beans. It refills 3 hearts.",
    allowReSelection: true,
    conditions: {
      customCheck: (context) => {
        return (
          !commonCheckAugmentByCategoryAndTier(context, 'heart', 'titanium') &&
          canRecoverHeart(context, 3)
        )
      },
    },
  },
  {
    category: 'heart',
    tier: 'titanium',
    id: "Gino's Winning Headband",
    nameKor: '지노의 필승 머리띠',
    nameEng: "Gino's Winning Headband",
    descriptionKor:
      '체력이 없는 우리에게 지노가 필승 머리띠를 빌려줬어요! 체력을 모두 회복해요.',
    descriptionEng:
      'Gino lent us his winning headband! The hearts are refilled.',
    conditions: {
      customCheck: (context) => {
        return (
          !commonCheckAugmentByCategoryAndTier(context, 'heart', 'titanium') &&
          context.currentHeart === 1
        )
      },
    },
  },
  // Heart 관련 (최대 하트 증가, 중복 선택 불가)
  {
    category: 'heart',
    tier: 'gold',
    id: "Blanc's Growth Pill",
    nameKor: '블랑의 성장 알약',
    nameEng: "Blanc's Growth Pill",
    descriptionKor: '블랑의 성장 알약을 먹었어요! 최대 하트가 1 증가해요.',
    descriptionEng:
      "You ate Blanc's growth pill! The max heart increases by 1.",
    conditions: {
      customCheck: (context: AugmentContext) => {
        // 이미 최대 하트 증가 증강이 선택되어 있으면 제외 (중복 선택 방지)
        return !(context.maxHeart > context.baseMaxHeart)
      },
    },
  },

  // Shield 관련
  {
    category: 'shield',
    tier: 'silver',
    id: 'Hire Leoni!',
    nameKor: '레오니 고용!',
    nameEng: 'Hire Leoni!',
    descriptionKor: '레오니를 고용했어요! 보호막 1개를 획득해요.',
    descriptionEng: 'You hired Leoni! You gain 1 shield.',
    allowReSelection: true,
    conditions: {
      customCheck: (context) => {
        // 보호막이 있으면 제외
        if (context.hasShield) {
          return false
        }

        return true
      },
    },
  },
]
