import { commonCheckIsFirstStage } from '@assets/data/augment/common'
import { IAugment } from '@hooks/study/remix/useAugmentManager'

export const specialAugments: IAugment[] = [
  {
    category: 'special',
    tier: 'titanium',
    id: "Roro's Birthday Party",
    nameKor: '로로의 생일 파티',
    nameEng: "Roro's Birthday Party",
    descriptionKor:
      '로로의 생일 파티가 시작되었어요! 획득 가능한 모든 최고 등급 아이템을 획득해요.',
    descriptionEng:
      "Roro's birthday party has started! You can get all the highest tier items that are available.",
    conditions: {
      customCheck: (context) => {
        return commonCheckIsFirstStage(context)
      },
    },
  },
]
