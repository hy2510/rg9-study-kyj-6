import { commonCheckAugmentByCategory } from '@assets/data/augment/common'
import { IAugment } from '@hooks/study/remix/useAugmentManager'

export const sentenceAugments: IAugment[] = [
  {
    category: 'sentence',
    tier: 'silver',
    id: "Goma's Torn Note",
    nameKor: '고마의 찢어진 노트 조각',
    nameEng: "Goma's Torn Note",
    descriptionKor:
      '고마의 찢어진 노트 조각을 발견했어요! 문제당 1번 음원의 문장을 볼 수 있어요.',
    descriptionEng:
      "You found Goma's torn note! You can see the sentence of the audio once per problem.",
    conditions: {
      activityTypes: ['ListeningActivity3', 'ListeningActivity4'],
      customCheck: (context) => {
        return !commonCheckAugmentByCategory(context, 'sentence')
      },
    },
  },
  {
    category: 'sentence',
    tier: 'emerald',
    id: "Goma's Note",
    nameKor: '고마의 노트',
    nameEng: "Goma's Note",
    descriptionKor: '고마의 노트를 발견했어요! 음원의 문장을 볼 수 있어요.',
    descriptionEng:
      "You found Goma's note! You can see the sentence of the audio.",
    conditions: {
      activityTypes: ['ListeningActivity3', 'ListeningActivity4'],
      customCheck: (context) => {
        return !commonCheckAugmentByCategory(context, 'sentence')
      },
    },
  },
]
