import { commonCheckAugmentByCategory } from '@assets/data/augment/common'
import { IAugment } from '@hooks/study/remix/useAugmentManager'
import { ACTIVITY } from '@src/constants/study/studyConstants'

export const audioAugments: IAugment[] = [
  // 단일 음원 버튼
  {
    category: 'audio-question',
    tier: 'silver',
    id: 'Rabbit Chello Robot',
    nameKor: '토끼 첼로 로봇',
    nameEng: 'Rabbit Chello Robot',
    descriptionKor:
      '토끼 첼로 로봇을 얻었어요! 빠르게 재생되는 음원이 활성화되요.',
    descriptionEng:
      'You found Rabbit Chello Robot! The audio of Chello will be played faster.',
    conditions: {
      activityTypes: [
        ACTIVITY.VOCABULARY_1,
        ACTIVITY.VOCABULARY_2,
        ACTIVITY.CLOZE_1,
        ACTIVITY.CLOZE_2,
        ACTIVITY.WRITING_1,
      ],
      customCheck: (context) => {
        return !commonCheckAugmentByCategory(context, 'audio-question')
      },
    },
  },
  {
    category: 'audio-question',
    tier: 'gold',
    id: 'Chello Robot',
    nameKor: '첼로 로봇',
    nameEng: 'Chello Robot',
    descriptionKor: '첼로 로봇을 얻었어요! 음원 버튼이 활성화되요.',
    descriptionEng: 'You found Chello Robot! The audio button will be enabled.',
    conditions: {
      activityTypes: [
        ACTIVITY.VOCABULARY_1,
        ACTIVITY.VOCABULARY_2,
        ACTIVITY.CLOZE_1,
        ACTIVITY.CLOZE_2,
        ACTIVITY.WRITING_1,
      ],
      customCheck: (context) => {
        return !commonCheckAugmentByCategory(context, 'audio-question')
      },
    },
  },
  {
    category: 'audio-question',
    tier: 'emerald',
    id: 'Tortoise Chello Robot',
    nameKor: '거북이 첼로 로봇',
    nameEng: 'Tortoise Chello Robot',
    descriptionKor:
      '거북이 첼로 로봇을 얻었어요! 느리게 재생되는 음원 버튼이 활성화되요.',
    descriptionEng:
      'You found Tortoise Chello Robot! The slow playback audio button will be enabled.',
    conditions: {
      activityTypes: [
        ACTIVITY.LISTENING_3,
        ACTIVITY.VOCABULARY_1,
        ACTIVITY.VOCABULARY_2,
        ACTIVITY.CLOZE_1,
        ACTIVITY.CLOZE_2,
        ACTIVITY.CLOZE_3,
        ACTIVITY.WRITING_1,
      ],
      customCheck: (context) => {
        return !commonCheckAugmentByCategory(context, 'audio-question')
      },
    },
  },
  // 단일 음원 버튼 - 재생 횟수 제한
  {
    category: 'audio-question',
    tier: 'silver',
    id: "Jack's One-Time Amplifier",
    nameKor: '잭의 일회용 확성기',
    nameEng: "Jack's One-Time Amplifier",
    descriptionKor: '잭의 일회용 확성기를 얻었어요! 재생 횟수가 1회 증가해요',
    descriptionEng:
      "You found Jack's One-Time Amplifier! The playback count will be increased by 1.",
    conditions: {
      activityTypes: [
        ACTIVITY.LISTENING_3,
        ACTIVITY.VOCABULARY_1,
        ACTIVITY.VOCABULARY_2,
        ACTIVITY.CLOZE_1,
        ACTIVITY.CLOZE_2,
        ACTIVITY.CLOZE_3,
        ACTIVITY.WRITING_1,
      ],
      customCheck: (context) => {
        return !commonCheckAugmentByCategory(context, 'audio-question')
      },
    },
  },
  // 다중 음원 버튼
  {
    category: 'audio-option',
    tier: 'silver',
    id: "Chello's Fast Recording Tape",
    nameKor: '첼로의 빠르게 녹음한 테이프',
    nameEng: "Chello's Fast Recording Tape",
    descriptionKor:
      '첼로가 빠르게 녹음한 테이프를 얻었어요! 빠른 속도로 재생되는 음원 버튼이 활성화되요.',
    descriptionEng:
      "You found Chello's fast recording tape! The fast playback audio button will be enabled.",
    conditions: {
      activityTypes: [],
      customCheck: (context) => {
        return !commonCheckAugmentByCategory(context, 'audio-option')
      },
    },
  },
  {
    category: 'audio-option',
    tier: 'gold',
    id: "Chello's Recording Tape",
    nameKor: '첼로의 녹음 테이프',
    nameEng: "Chello's Recording Tape",
    descriptionKor: '첼로가 녹음한 테이프를 얻었어요! 음원 버튼이 활성화되요.',
    descriptionEng:
      "You found Chello's recording tape! The audio button will be enabled.",
    conditions: {
      activityTypes: [],
      customCheck: (context) => {
        return !commonCheckAugmentByCategory(context, 'audio-option')
      },
    },
  },
  {
    category: 'audio-option',
    tier: 'emerald',
    id: "Chello's Slow Recording Tape",
    nameKor: '첼로의 느리게 녹음한 테이프',
    nameEng: "Chello's Slow Recording Tape",
    descriptionKor:
      '첼로가 느리게 녹음한 테이프를 얻었어요! 느린 속도로 재생되는 음원 버튼이 활성화되요.',
    descriptionEng:
      "You found Chello's slow recording tape! The slow playback audio button will be enabled.",
    conditions: {
      activityTypes: [ACTIVITY.LISTENING_4],
      customCheck: (context) => {
        return !commonCheckAugmentByCategory(context, 'audio-option')
      },
    },
  },
]
