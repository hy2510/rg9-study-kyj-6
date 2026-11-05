import { IAugment } from '@hooks/study/remix/useAugmentManager'
import { ACTIVITY } from '@src/constants/study/studyConstants'

export const wordAugments: IAugment[] = [
  {
    category: 'word',
    tier: 'silver',
    id: "Blanc's Mysterious Eye Drop",
    nameKor: '블랑의 신비한 안약',
    nameEng: "Blanc's Mysterious Eye Drop",
    descriptionKor: '블랑이 만든 신비한 안약이에요! 단어의 글자수가 표시되요.',
    descriptionEng:
      "You found Blanc's mysterious eye drop! The number of letters in the word is shown.",
    conditions: {
      activityTypes: [
        ACTIVITY.CLOZE_2,
        ACTIVITY.CLOZE_3,
        ACTIVITY.VOCABULARY_4,
      ],
    },
  },
  {
    category: 'word',
    tier: 'gold',
    id: "Baro's Telescope",
    nameKor: '바로의 망원경',
    nameEng: "Baro's Telescope",
    descriptionKor:
      '바로가 사용하던 망원경을 획득해요! 뒷글자와 글자수가 표시되요.',
    descriptionEng:
      "You found Baro's telescope! The last letter of the word is shown.",
    conditions: {
      activityTypes: [
        ACTIVITY.CLOZE_2,
        ACTIVITY.CLOZE_3,
        ACTIVITY.VOCABULARY_4,
      ],
    },
  },
  {
    category: 'word',
    tier: 'emerald',
    id: 'Fair Wind',
    nameKor: '순풍',
    nameEng: 'Fair Wind',
    descriptionKor:
      '바람이 우리를 도와주나봐요! 안개가 걷혀 앞글자와 글자수가 표시되요.',
    descriptionEng:
      'The wind is helping us! The fog is clearing and the first letter of the word is shown.',
    conditions: {
      activityTypes: [
        ACTIVITY.CLOZE_2,
        ACTIVITY.CLOZE_3,
        ACTIVITY.VOCABULARY_4,
      ],
    },
  },
  {
    category: 'word',
    tier: 'titanium',
    id: "Tori's Starry Astrology",
    nameKor: '토리의 별자리 점성술',
    nameEng: "Tori's Starry Astrology",
    descriptionKor:
      '토리가 별자리를 활용해 길을 찾아냈어요! 앞글자, 뒷글자, 글자수가 모두 표시되요.',
    descriptionEng:
      'Tori found the way by using the stars! The first letter, last letter, and number of letters are shown.',
    conditions: {
      activityTypes: [
        ACTIVITY.CLOZE_2,
        ACTIVITY.CLOZE_3,
        ACTIVITY.VOCABULARY_4,
      ],
    },
  },
]
