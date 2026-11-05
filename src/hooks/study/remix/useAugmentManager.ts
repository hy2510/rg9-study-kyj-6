import { useMemo, useState } from 'react'

import { AugmentData } from '@assets/data/augment'
import {
  baseTierWeights,
  tierWeightAdjustmentsStage2,
  tierWeightAdjustmentsStage3,
  tierWeightAdjustmentsStage4,
} from '@assets/data/augment/tierData'
import { ActivityType } from '@hooks/study/remix/useQuizManager'
import {
  AUDIO_OPTION_PLAYBACK_MAP,
  AUDIO_QUESTION_PLAYBACK_MAP,
  AUGMENT_CONSTANTS,
  AUGMENT_IDS,
  HEART_MAP,
} from '@src/constants/study/remix/augment'
import { StudyMode } from '@src/interfaces/common/Types'
import { AugmentTier } from '@src/interfaces/study/remix/AugmentTier'

export type AugmentCategory =
  | 'heart'
  | 'shield'
  | 'time'
  | 'point'
  | 'audio-question'
  | 'audio-option'
  | 'image'
  | 'word'
  | 'sentence'
  | 'keyboard'
  | 'special'

/**
 * Augment 조건 체크를 위한 컨텍스트
 */
export interface AugmentContext {
  studyMode: StudyMode
  currentHeart: number
  baseMaxHeart: number
  maxHeart: number
  hasShield: boolean
  selectedAugments: SelectedAugment[]
  currentTime: number
  initialTime: number
  activityTypes: ActivityType[]
  stage: number
  totalStage: number // 전체 스테이지 수 (마지막 스테이지 확인용)
}

/**
 * Augment 조건 설정
 */
export interface AugmentConditions {
  activityTypes?: ActivityType[] // 특정 activityType에서만
  customCheck?: (context: AugmentContext) => boolean // 커스텀 조건 함수
}

export interface IAugment {
  category: AugmentCategory
  tier: AugmentTier
  id: string
  nameKor: string
  nameEng: string
  descriptionKor: string
  descriptionEng: string
  conditions?: AugmentConditions // 특정 상황에서만 나타나는 조건
  allowReSelection?: boolean
}

export interface SelectedAugment extends IAugment {
  stage: number
  isActive: boolean
}

export type AugmentOptions = {
  heart: {
    maxHeartBonus: number
  }
  time: {
    timeInterval: number
  }
  questionAudio: {
    enableSound: boolean
    enablePlayCount: number
    playback: 0.75 | 1 | 1.25
    isInfinitePlay: boolean
  }
  exampleAudio: {
    enableSound: boolean
    playback: 0.75 | 1 | 1.25
  }
  image: {
    showImage: boolean
  }
  sentence: {
    showSentence: boolean
    showAll: boolean
  }
  word: {
    showFirst: boolean
    showLast: boolean
    showMask: boolean
  }
  keyboard: {
    enableKeyboard: boolean
    wrongKeyCount: number
  }
}

/**
 * Audio 증강 옵션 설정 헬퍼 함수
 * @param augment 찾은 augment (없으면 undefined)
 * @param audioOption 설정할 audio 옵션 객체
 * @param idToPlaybackMap augment ID를 playback 속도로 매핑하는 객체
 */
const applyAudioAugmentQuestion = (
  augment: SelectedAugment | undefined,
  audioOption: {
    enableSound: boolean
    enablePlayCount: number
    isInfinitePlay: boolean
    playback: 0.75 | 1 | 1.25
  },
  idToPlaybackMap: Record<string, 0.75 | 1 | 1.25>,
): void => {
  if (!augment) return

  switch (augment.id) {
    case AUGMENT_IDS.AUDIO_QUESTION.RABBIT_CHELLO_ROBOT:
    case AUGMENT_IDS.AUDIO_QUESTION.CHELLO_ROBOT:
    case AUGMENT_IDS.AUDIO_QUESTION.TORTOISE_CHELLO_ROBOT:
      audioOption.isInfinitePlay = true
      break

    case AUGMENT_IDS.AUDIO_QUESTION.JACK_ONE_TIME_AMPLIFIER:
      audioOption.isInfinitePlay = false
      audioOption.enablePlayCount += 1
      break
  }

  audioOption.enableSound = true

  const playback = idToPlaybackMap[augment.id]
  if (playback !== undefined) {
    audioOption.playback = playback
  }
}

/**
 * Audio 증강 옵션 설정 헬퍼 함수
 * @param augment 찾은 augment (없으면 undefined)
 * @param audioOption 설정할 audio 옵션 객체
 * @param idToPlaybackMap augment ID를 playback 속도로 매핑하는 객체
 */
const applyAudioAugmentOptions = (
  augment: SelectedAugment | undefined,
  audioOption: {
    enableSound: boolean
    playback: 0.75 | 1 | 1.25
  },
  idToPlaybackMap: Record<string, 0.75 | 1 | 1.25>,
): void => {
  if (!augment) return

  audioOption.enableSound = true

  const playback = idToPlaybackMap[augment.id]
  if (playback !== undefined) {
    audioOption.playback = playback
  }
}

/**
 * 증강 옵션을 가져오는 독립 함수
 * @param selectedAugments 선택된 증강 목록
 * @param activityType 활동 타입 (선택사항, 특정 활동 타입에 맞는 증강만 체크)
 * @returns 증강 옵션 객체
 */
export function getAugmentOptions(
  selectedAugments: SelectedAugment[],
  activityType?: ActivityType,
): AugmentOptions {
  // 기본값
  const options: AugmentOptions = {
    heart: {
      maxHeartBonus: 0,
    },
    time: {
      timeInterval: AUGMENT_CONSTANTS.TIME_INTERVAL.DEFAULT,
    },
    questionAudio: {
      enableSound: false,
      enablePlayCount: 0,
      isInfinitePlay: false,
      playback: AUGMENT_CONSTANTS.AUDIO_PLAYBACK.NORMAL,
    },
    exampleAudio: {
      enableSound: false,
      playback: AUGMENT_CONSTANTS.AUDIO_PLAYBACK.NORMAL,
    },
    image: {
      showImage: false,
    },
    sentence: {
      showSentence: false,
      showAll: false,
    },
    word: {
      showFirst: false,
      showLast: false,
      showMask: false,
    },
    keyboard: {
      enableKeyboard: false,
      wrongKeyCount: 0,
    },
  }

  // activityType에 맞는 활성화된 증강 찾기
  const relevantAugments = selectedAugments.filter((a) => {
    if (!a.isActive) return false
    if (activityType && a.conditions?.activityTypes) {
      return a.conditions.activityTypes.includes(activityType)
    }
    // activityType이 없으면 모든 활성화된 증강 체크
    return true
  })

  // Heart 증강 중 최대 하트 증가 효과가 있는 것 체크
  const heartMaxAugments = relevantAugments.filter(
    (a) => HEART_MAP[a.id] !== undefined,
  )
  options.heart.maxHeartBonus = heartMaxAugments.reduce((sum, a) => {
    const bonus = HEART_MAP[a.id] ?? 0
    return sum + bonus
  }, 0)

  // Word 증강 체크 (힌트 관련) - 여러 word 증강 효과 동시 적용
  const wordAugments = relevantAugments.filter((a) => a.category === 'word')

  if (wordAugments.length > 0) {
    options.word.showMask = true

    wordAugments.forEach((wordAugment) => {
      switch (wordAugment.id) {
        case AUGMENT_IDS.WORD.FAIR_WIND:
          options.word.showFirst = true
          break

        case AUGMENT_IDS.WORD.BARO_TELESCOPE:
          options.word.showLast = true
          break

        case AUGMENT_IDS.WORD.TORI_STARRY_ASTROLOGY:
          options.word.showFirst = true
          options.word.showLast = true
          break
      }
    })
  }

  // Keyboard 증강 체크
  const keyboardAugment = relevantAugments.filter(
    (a) => a.category === 'keyboard',
  )

  if (keyboardAugment.length > 0) {
    options.keyboard.enableKeyboard = true

    keyboardAugment.forEach((keyboardAugment) => {
      switch (keyboardAugment.id) {
        case AUGMENT_IDS.KEYBOARD.BASIC_KEYBOARD:
          options.keyboard.wrongKeyCount = 5
          break

        case AUGMENT_IDS.KEYBOARD.ADVANCED_KEYBOARD:
          options.keyboard.wrongKeyCount = 3
          break

        case AUGMENT_IDS.KEYBOARD.CUSTOM_KEYBOARD:
          options.keyboard.wrongKeyCount = 1
          break

        case AUGMENT_IDS.KEYBOARD.MYSTERIOUS_KEYBOARD:
          options.keyboard.wrongKeyCount = 0
          break
      }
    })
  }

  // Audio-question 증강 체크 (단일 문장용)
  const audioQuestionAugment = relevantAugments.find(
    (a) => a.category === 'audio-question',
  )

  applyAudioAugmentQuestion(
    audioQuestionAugment,
    options.questionAudio,
    AUDIO_QUESTION_PLAYBACK_MAP,
  )

  // Audio-option 증강 체크 (다중 문장용)
  const audioOptionAugment = relevantAugments.find(
    (a) => a.category === 'audio-option',
  )

  applyAudioAugmentOptions(
    audioOptionAugment,
    options.exampleAudio,
    AUDIO_OPTION_PLAYBACK_MAP,
  )

  // Time 증강 체크 (시간 속도 조절)
  const timeAugment = relevantAugments.find((a) => a.category === 'time')

  if (timeAugment) {
    if (
      timeAugment.id === AUGMENT_IDS.TIME.EDMOND_SECRET_GARDEN ||
      timeAugment.id === AUGMENT_IDS.TIME.GREENTHUMB_SECRET_GARDEN
    ) {
      options.time.timeInterval = AUGMENT_CONSTANTS.TIME_INTERVAL.SLOW
    }
  }

  const imageAugment = relevantAugments.find((a) => a.category === 'image')

  if (imageAugment) {
    options.image.showImage = true
  }

  // Sentence 증강 체크 (ListeningActivity3, ListeningActivity4)
  const sentenceAugment = relevantAugments.find(
    (a) => a.category === 'sentence',
  )

  if (sentenceAugment) {
    options.sentence.showSentence = true
    switch (sentenceAugment.id) {
      case AUGMENT_IDS.SENTENCE.GOMA_NOTE:
        options.sentence.showAll = true
        break
      case AUGMENT_IDS.SENTENCE.GOMA_TORN_NOTE:
        options.sentence.showAll = false
        break
    }
  }

  return options
}

interface UseAugmentProps {
  studyMode: StudyMode
  activityTypes: ActivityType[]
  currentHeart: number
  baseMaxHeart: number // 기본 최대 하트
  hasShield: boolean // 보호막 보유 여부
  currentTime: number // 현재 시간 (초 단위)
  initialTime: number // 초기 시간 (초 단위)
  stage: number // 현재 stage (조건 체크용)
  totalStage: number // 전체 스테이지 수 (마지막 스테이지 확인용)
}

export function useAugmentManager({
  studyMode,
  activityTypes,
  currentHeart,
  baseMaxHeart,
  hasShield,
  currentTime,
  initialTime,
  stage,
  totalStage,
}: UseAugmentProps) {
  // 선택된 augment들 (Voca 또는 Stage 끝날 때마다 추가됨)
  const [selectedAugments, setSelectedAugments] = useState<SelectedAugment[]>(
    [],
  )

  const augmentOptions = useMemo(
    () => getAugmentOptions(selectedAugments),
    [selectedAugments],
  )
  const maxHeart = baseMaxHeart + (augmentOptions.heart?.maxHeartBonus ?? 0)

  /**
   * activityTypes 조건 체크
   */
  const checkActivityTypes = (
    conditions: AugmentConditions,
    context: AugmentContext,
  ): boolean => {
    if (!conditions.activityTypes) {
      return true
    }

    return conditions.activityTypes.some((type) =>
      context.activityTypes.includes(type),
    )
  }

  /**
   * customCheck 조건 체크
   */
  const checkCustomCheck = (
    conditions: AugmentConditions,
    context: AugmentContext,
  ): boolean => {
    if (!conditions.customCheck || conditions.customCheck(context)) {
      return true
    }

    return false
  }

  /**
   * Augment 조건을 체크하는 함수
   * @param augment 체크할 augment
   * @param context 현재 컨텍스트
   * @returns 조건을 만족하면 true, 아니면 false
   */
  const checkAugmentConditions = (
    augment: IAugment,
    context: AugmentContext,
  ): boolean => {
    const conditions = augment.conditions

    if (!conditions) {
      return true
    } else {
      // activityTypes, customCheck 체크
      if (
        checkActivityTypes(conditions, context) &&
        checkCustomCheck(conditions, context)
      ) {
        return true
      }

      return false
    }
  }

  /**
   * Augment 선택 함수
   * @param augment 선택한 augment
   * @param stage 선택한 stage
   */
  const selectAugment = (augment: IAugment, stage: number) => {
    const selectedAugment: SelectedAugment = {
      ...augment,
      stage,
      isActive: true,
    }

    setSelectedAugments((prev) => [...prev, selectedAugment])
  }

  /**
   * 특정 스테이지에서 선택된 tier 확인
   * @param targetStage 확인할 스테이지 번호 (0-based)
   * @returns 해당 스테이지에서 선택된 tier, 없으면 null
   */
  const getSelectedTierByStage = (targetStage: number): AugmentTier | null => {
    const selectedAugment = selectedAugments.find(
      (a) => a.stage === targetStage,
    )
    return selectedAugment?.tier || null
  }

  /**
   * Tier에 따른 가중치 반환
   * Stage 1: baseTierWeights 사용
   * Stage 2: Stage 1 선택에 따라 tierWeightAdjustmentsStage2 사용
   * Stage 3: Stage 1 + Stage 2 선택 조합에 따라 tierWeightAdjustmentsStage3 사용
   * Stage 4: Stage 1 + Stage 2 + Stage 3 선택 조합에 따라 tierWeightAdjustmentsStage4 사용
   * @param tier augment tier
   * @returns tier에 따른 가중치 (높을수록 높은 확률)
   */
  const getTierWeight = (tier: AugmentTier): number => {
    // Stage 1: 기본 가중치
    if (stage === 0) {
      return baseTierWeights[tier]
    }

    // Stage 2: Stage 1 선택에 따라 조정
    if (stage === 1) {
      const stage1Tier = getSelectedTierByStage(0)
      if (stage1Tier && tierWeightAdjustmentsStage2[stage1Tier]) {
        return tierWeightAdjustmentsStage2[stage1Tier][tier]
      }
      return baseTierWeights[tier]
    }

    // Stage 3: Stage 1 + Stage 2 선택 조합에 따라 조정
    if (stage === 2) {
      const stage1Tier = getSelectedTierByStage(0)
      const stage2Tier = getSelectedTierByStage(1)

      // Stage 3 가중치 시도
      if (
        stage1Tier &&
        stage2Tier &&
        tierWeightAdjustmentsStage3[stage1Tier]?.[stage2Tier]
      ) {
        return tierWeightAdjustmentsStage3[stage1Tier][stage2Tier][tier]
      }

      // Fallback: Stage 2 가중치 사용
      if (stage1Tier && tierWeightAdjustmentsStage2[stage1Tier]) {
        return tierWeightAdjustmentsStage2[stage1Tier][tier]
      }

      return baseTierWeights[tier]
    }

    // Stage 4: Stage 1 + Stage 2 + Stage 3 선택 조합에 따라 조정
    if (stage === 3) {
      const stage1Tier = getSelectedTierByStage(0)
      const stage2Tier = getSelectedTierByStage(1)
      const stage3Tier = getSelectedTierByStage(2)

      // Stage 4 가중치 시도
      if (
        stage1Tier &&
        stage2Tier &&
        stage3Tier &&
        tierWeightAdjustmentsStage4[stage1Tier]?.[stage2Tier]?.[stage3Tier]
      ) {
        return tierWeightAdjustmentsStage4[stage1Tier][stage2Tier][stage3Tier][
          tier
        ]
      }

      // Fallback: Stage 3 가중치 사용
      if (
        stage1Tier &&
        stage2Tier &&
        tierWeightAdjustmentsStage3[stage1Tier]?.[stage2Tier]
      ) {
        return tierWeightAdjustmentsStage3[stage1Tier][stage2Tier][tier]
      }

      return baseTierWeights[tier]
    }

    // Stage 5 이상: 기본 가중치
    return baseTierWeights[tier]
  }

  /**
   * 가중치 기반 랜덤 선택 (단일 항목)
   * @param items 선택할 항목 배열
   * @param getWeight 가중치를 반환하는 함수
   * @returns 선택된 항목 (1개)
   */
  const weightedRandomSelectOne = <T>(
    items: T[],
    getWeight: (item: T) => number,
  ): T | null => {
    if (items.length === 0) {
      return null
    }

    if (items.length === 1) {
      return items[0]
    }

    // 전체 가중치 합 계산
    const totalWeight = items.reduce((sum, item) => sum + getWeight(item), 0)

    let random = Math.random() * totalWeight

    // 가중치 기반으로 선택
    for (let i = 0; i < items.length; i++) {
      const weight = getWeight(items[i])
      random -= weight

      if (random <= 0) {
        return items[i]
      }
    }

    // 마지막 항목 반환 (rounding error 방지)
    return items[items.length - 1]
  }

  const groupByTier = <T>(
    items: T[],
    getTier: (item: T) => AugmentTier,
  ): Map<AugmentTier, T[]> => {
    const tierGroups = new Map<AugmentTier, T[]>()
    items.forEach((item) => {
      const tier = getTier(item)
      if (!tierGroups.has(tier)) {
        tierGroups.set(tier, [])
      }
      tierGroups.get(tier)!.push(item)
    })
    return tierGroups
  }

  /**
   * Tier 그룹에서 가중치 기반으로 하나 선택하는 헬퍼 함수
   * @returns 선택된 항목, 해당 tier, 인덱스 정보, null이면 선택 실패
   */
  const selectOneFromTierGroups = <T>(
    tierGroups: Map<AugmentTier, T[]>,
    getWeight: (item: T) => number,
  ): { item: T; tier: AugmentTier; index: number; items: T[] } | null => {
    const tierRepresentatives: Array<{ tier: AugmentTier; items: T[] }> = []
    tierGroups.forEach((tierItems, tier) => {
      tierRepresentatives.push({ tier, items: tierItems })
    })

    const selectedTierGroup = weightedRandomSelectOne(
      tierRepresentatives,
      (rep) => getWeight(rep.items[0]), // 같은 tier는 같은 가중치를 가지므로 첫 번째 아이템의 가중치 사용
    )

    if (!selectedTierGroup) return null

    const tierItems = selectedTierGroup.items
    const randomIndex = Math.floor(Math.random() * tierItems.length)
    return {
      item: tierItems[randomIndex],
      tier: selectedTierGroup.tier,
      index: randomIndex,
      items: tierItems,
    }
  }

  const selectOnePerCategory = <T>(
    categoryGroups: Map<string, T[]>,
    getTier: (item: T) => AugmentTier,
    getWeight: (item: T) => number,
  ): T[] => {
    const selectedByCategory: T[] = []

    categoryGroups.forEach((groupItems) => {
      const tierGroups = groupByTier(groupItems, getTier)
      const selected = selectOneFromTierGroups(tierGroups, getWeight)
      if (selected) {
        selectedByCategory.push(selected.item)
      }
    })

    return selectedByCategory
  }

  const selectByTierCompetition = <T>(
    items: T[],
    getTier: (item: T) => AugmentTier,
    getWeight: (item: T) => number,
  ): T[] => {
    const finalSelected: T[] = []
    const tierGroups = groupByTier(items, getTier)

    while (
      finalSelected.length < AUGMENT_CONSTANTS.AUGMENT_COUNT &&
      tierGroups.size > 0
    ) {
      const selected = selectOneFromTierGroups(tierGroups, getWeight)
      if (!selected) break

      finalSelected.push(selected.item)

      selected.items.splice(selected.index, 1)

      if (selected.items.length === 0) {
        tierGroups.delete(selected.tier)
      }
    }

    return finalSelected
  }

  /**
   * Category별로 그룹화하고 각 category 내에서 tier 경쟁하여 선택
   * @param items 선택할 항목 배열
   * @param getCategory 카테고리를 반환하는 함수
   * @param getTier tier를 반환하는 함수
   * @param getWeight 가중치를 반환하는 함수
   * @returns 선택된 항목 배열
   */
  const selectByCategoryCompetition = <T>(
    items: T[],
    getCategory: (item: T) => string,
    getTier: (item: T) => AugmentTier,
    getWeight: (item: T) => number,
  ): T[] => {
    // 1. Category별로 그룹화
    const categoryGroups = new Map<string, T[]>()
    items.forEach((item) => {
      const category = getCategory(item)
      if (!categoryGroups.has(category)) {
        categoryGroups.set(category, [])
      }
      categoryGroups.get(category)!.push(item)
    })

    // 2. 각 category에서 하나씩 선택
    const selectedByCategory = selectOnePerCategory(
      categoryGroups,
      getTier,
      getWeight,
    )

    // 3. 선택된 항목이 count 이하면 모두 반환
    if (selectedByCategory.length < AUGMENT_CONSTANTS.AUGMENT_COUNT) {
      return selectedByCategory
    }

    // 4. count보다 많으면 tier 경쟁으로 count개 선택
    return selectByTierCompetition(selectedByCategory, getTier, getWeight)
  }

  /**
   * 필터링된 augment 목록 생성 (헬퍼 함수)
   */
  const createFilteredAugments = (
    augments: IAugment[],
    context: AugmentContext,
  ): IAugment[] => {
    return augments.filter((augment) =>
      checkAugmentConditions(augment, context),
    )
  }

  /**
   * 골라야 할 augment 목록 생성
   */
  const selectableAugments = useMemo<IAugment[]>(() => {
    if (activityTypes.length === 0) {
      return []
    }

    const augmentContext: AugmentContext = {
      studyMode,
      currentHeart,
      baseMaxHeart,
      maxHeart,
      hasShield,
      selectedAugments,
      currentTime,
      initialTime,
      activityTypes,
      stage,
      totalStage,
    }

    const filtered = createFilteredAugments(AugmentData, augmentContext)

    // 이미 선택된 증강(id)은 후보에서 제외 (allowReSelection: true면 예외)
    const selectedIds = new Set(selectedAugments.map((a) => a.id))
    const filteredExcludingSelected = filtered.filter((augment) => {
      if (!selectedIds.has(augment.id)) return true
      return augment.allowReSelection === true
    })

    return selectByCategoryCompetition(
      filteredExcludingSelected,
      (augment) => augment.category,
      (augment) => augment.tier,
      (augment) => getTierWeight(augment.tier),
    )
  }, [
    selectedAugments,
    currentHeart,
    maxHeart,
    hasShield,
    currentTime,
    initialTime,
    activityTypes,
    stage,
    totalStage,
  ])

  /**
   * 증강 옵션을 가져오기 (내부에서 getAugmentOptions 함수 사용)
   * @param activityType 활동 타입 (선택사항, 특정 활동 타입에 맞는 증강만 체크)
   * @returns 증강 옵션 객체
   */
  const getAugmentOptionsInternal = (
    activityType?: ActivityType,
  ): AugmentOptions => {
    return getAugmentOptions(selectedAugments, activityType)
  }

  return {
    selectedAugments,
    selectableAugments,
    selectAugment,
    getAugmentOptions: getAugmentOptionsInternal,
  }
}
