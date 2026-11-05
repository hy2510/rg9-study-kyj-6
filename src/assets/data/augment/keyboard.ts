import { commonCheckAugmentByCategory } from '@assets/data/augment/common'
import { IAugment } from '@hooks/study/remix/useAugmentManager'
import { ACTIVITY } from '@src/constants/study/studyConstants'

export const keyboardAugments: IAugment[] = [
  {
    category: 'keyboard',
    tier: 'silver',
    id: 'Basic Keyboard',
    nameKor: '기본 키보드',
    nameEng: 'Basic Keyboard',
    descriptionKor: '기본 키보드를 얻었어요! 전용 키보드가 활성화되요.',
    descriptionEng:
      'You found the basic keyboard! The basic keyboard will be enabled.',
    conditions: {
      activityTypes: [
        ACTIVITY.CLOZE_2,
        ACTIVITY.CLOZE_3,
        ACTIVITY.VOCABULARY_4,
      ],
      customCheck: (context) => {
        return !commonCheckAugmentByCategory(context, 'keyboard')
      },
    },
  },
  {
    category: 'keyboard',
    tier: 'gold',
    id: 'Advanced Keyboard',
    nameKor: '고급 키보드',
    nameEng: 'Advanced Keyboard',
    descriptionKor: '고급 키보드를 얻었어요! 전용 키보드가 활성화되요.',
    descriptionEng:
      'You found the advanced keyboard! The advanced keyboard will be enabled.',
    conditions: {
      activityTypes: [
        ACTIVITY.CLOZE_2,
        ACTIVITY.CLOZE_3,
        ACTIVITY.VOCABULARY_4,
      ],
      customCheck: (context) => {
        return !commonCheckAugmentByCategory(context, 'keyboard')
      },
    },
  },
  {
    category: 'keyboard',
    tier: 'emerald',
    id: 'Custom Keyboard',
    nameKor: '커스텀 키보드',
    nameEng: 'Custom Keyboard',
    descriptionKor: '커스텀 키보드를 얻었어요! 전용 키보드가 활성화되요.',
    descriptionEng:
      'You found the custom keyboard! The custom keyboard will be enabled.',
    conditions: {
      activityTypes: [
        ACTIVITY.CLOZE_2,
        ACTIVITY.CLOZE_3,
        ACTIVITY.VOCABULARY_4,
      ],
      customCheck: (context) => {
        return !commonCheckAugmentByCategory(context, 'keyboard')
      },
    },
  },
  {
    category: 'keyboard',
    tier: 'titanium',
    id: 'Mysterious Keyboard',
    nameKor: '신비한 키보드',
    nameEng: 'Mystrious Keyboard',
    descriptionKor: '신비한 키보드를 얻었어요! 전용 키보드가 활성화되요.',
    descriptionEng:
      'You found the mysterious keyboard! The mysterious keyboard will be enabled.',
    conditions: {
      activityTypes: [
        ACTIVITY.CLOZE_2,
        ACTIVITY.CLOZE_3,
        ACTIVITY.VOCABULARY_4,
      ],
      customCheck: (context) => {
        return !commonCheckAugmentByCategory(context, 'keyboard')
      },
    },
  },
]
