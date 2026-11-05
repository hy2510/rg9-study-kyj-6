import { commonCheckAugmentByCategory } from '@assets/data/augment/common'
import { IAugment } from '@hooks/study/remix/useAugmentManager'
import { ACTIVITY } from '@src/constants/study/studyConstants'

export const imageAugments: IAugment[] = [
  {
    category: 'image',
    tier: 'silver',
    id: "Edmond's Drawing Notebook",
    nameKor: '에드몽의 그림 노트',
    nameEng: "Edmond's Drawing Notebook",
    descriptionKor:
      '에드몽의 그림 노트를 발견했어요! 문제에 관련된 이미지가 나타나요.',
    descriptionEng:
      "You found Edmond's drawing notebook! The image related to the problem is displayed.",
    conditions: {
      activityTypes: [ACTIVITY.READING_COMP_3],
      customCheck: (context) => {
        return !commonCheckAugmentByCategory(context, 'image')
      },
    },
  },
]
