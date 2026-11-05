import { useCallback, useContext, useEffect, useMemo, useState } from 'react'

import shuffle from 'lodash/shuffle'

import { AppContext, AppContextProps } from '@contexts/AppContext'
import {
  getClozeTest1,
  getClozeTest2,
  getClozeTest3,
} from '@services/quiz/ClozeTestAPI'
import {
  getListeningActivity1,
  getListeningActivity2,
  getListeningActivity3,
  getListeningActivity4,
} from '@services/quiz/ListeningActivityApi'
import {
  getReadingComprehension1,
  getReadingComprehension2,
  getReadingComprehension3,
  getReadingComprehension4,
} from '@services/quiz/ReadingComprehensionAPI'
import { getSummary1, getSummary2 } from '@services/quiz/SummaryApi'
import { getTrueOrFalse } from '@services/quiz/TrueOrFalseAPI'
import {
  getVocabularyTest1,
  getVocabularyTest2,
  getVocabularyTest3,
  getVocabularyTest4,
} from '@services/quiz/VocabularyAPI'
import {
  getWritingActivity1,
  getWritingActivity2,
} from '@services/quiz/WritingActivityAPI'
import { ACTIVITY } from '@src/constants/study/studyConstants'
import { IQuizStudyRef } from '@src/interfaces/common/Common'

export type ActivityType = (typeof ACTIVITY)[keyof typeof ACTIVITY]

/**
 * Activity Type과 API 함수 매핑
 */
const ACTIVITY_API_MAP: Record<
  ActivityType,
  (studyData: IQuizStudyRef) => Promise<QuizData>
> = {
  [ACTIVITY.CLOZE_1]: getClozeTest1,
  [ACTIVITY.CLOZE_2]: getClozeTest2,
  [ACTIVITY.CLOZE_3]: getClozeTest3,
  [ACTIVITY.TRUE_OR_FALSE]: getTrueOrFalse,
  [ACTIVITY.READING_COMP_1]: getReadingComprehension1,
  [ACTIVITY.READING_COMP_2]: getReadingComprehension2,
  [ACTIVITY.READING_COMP_3]: getReadingComprehension3,
  [ACTIVITY.READING_COMP_4]: getReadingComprehension4,
  [ACTIVITY.LISTENING_1]: getListeningActivity1,
  [ACTIVITY.LISTENING_2]: getListeningActivity2,
  [ACTIVITY.LISTENING_3]: getListeningActivity3,
  [ACTIVITY.LISTENING_4]: getListeningActivity4,
  [ACTIVITY.VOCABULARY_1]: getVocabularyTest1,
  [ACTIVITY.VOCABULARY_2]: getVocabularyTest2,
  [ACTIVITY.VOCABULARY_3]: getVocabularyTest3,
  [ACTIVITY.VOCABULARY_4]: getVocabularyTest4,
  [ACTIVITY.WRITING_1]: getWritingActivity1,
  [ACTIVITY.WRITING_2]: getWritingActivity2,
  [ACTIVITY.SUMMARY_1]: getSummary1,
  [ACTIVITY.SUMMARY_2]: getSummary2,
} as Record<ActivityType, (studyData: IQuizStudyRef) => Promise<QuizData>>

/**
 * 퀴즈 관련 상수
 */
const QUIZ_CONSTANTS = {
  ROUNDS_PER_STAGE: 5,
  OTHERS_ROUNDS: 4, // Round 1-4
  VOCABULARY_ROUND: 5, // Round 5
} as const

/**
 * 레벨 체크 및 Stage 계산 유틸 함수
 */
const LevelUtils = {
  /**
   * K 레벨인지 확인
   */
  isKLevel: (bookLevel: string): boolean => {
    return bookLevel.toUpperCase().startsWith('K')
  },

  /**
   * 레벨 1인지 확인
   */
  isLevel1: (bookLevel: string): boolean => {
    return bookLevel.toUpperCase().startsWith('1')
  },

  /**
   * 카드보카 레벨인지 확인 (K, 1 레벨 제외)
   */
  isCardVocaLevel: (bookLevel: string): boolean => {
    const upper = bookLevel.toUpperCase()
    return !upper.startsWith('K') && !upper.startsWith('1')
  },

  /**
   * 레벨에 따른 총 Stage 수 계산
   */
  getTotalStages: (bookLevel: string): number => {
    const level = bookLevel.toUpperCase().substring(0, 1)
    const stageMap: Record<string, number> = {
      K: 1,
      '1': 2,
      '2': 3,
      '3': 3,
      '4': 4,
      '5': 4,
      '6': 4,
    }
    return stageMap[level] ?? 1
  },

  /**
   * 레벨의 첫 글자 추출
   */
  getLevelPrefix: (bookLevel: string): string => {
    return bookLevel.toUpperCase().substring(0, 1)
  },
}

/**
 * 모든 Quiz 타입의 공통 베이스 인터페이스
 * QuizId와 QuizNo는 필수이며, 나머지는 선택적 속성
 */
export type BaseQuiz = {
  QuizId: string
  QuizNo: number
  Question: {
    Text: string
    Sound: string
    Image: string
    Korean: string
    English: string
    Britannica: string
    Chinese: string
    Japanese: string
    Vietnamese: string
    Indonesian: string
    [key: string]: any
  }
  Examples: {
    Text: string
    Sound: string
    Image: string
    Korean: string
    [key: string]: any
  }[]
  [key: string]: any
}

/**
 * Quiz 데이터 타입
 * 모든 Quiz API 응답은 Quiz 배열을 포함
 */
type QuizData = {
  Quiz: BaseQuiz[]
  ContentsId?: number
  IsQuizTimeoutIncorrect?: boolean
  QuizAnswerCount?: number
  QuizTime?: number
  [key: string]: any
}

/**
 * 모든 Quiz 타입을 BaseQuiz로 변환하는 함수
 * @param quiz 원본 Quiz 객체 (any 타입)
 * @returns BaseQuiz 객체
 */
function normalizeQuizToBase(quiz: any): BaseQuiz {
  return {
    QuizId: quiz.QuizId || '',
    QuizNo: quiz.QuizNo || 0,
    Question: quiz.Question || {},
    Examples: quiz.Examples || [],
    ...quiz, // 원본 데이터도 유지 (필요한 경우 접근 가능)
  }
}

export interface QuizDataWithActivityType {
  activityType: ActivityType
  data: QuizData
}

/**
 * 셔플된 퀴즈 아이템 인터페이스
 * 각 문제는 원래 액티비티 타입과 Quiz 객체를 포함
 */
export interface ShuffledQuizItem {
  activityType: ActivityType
  quizzes: BaseQuiz[]
  originalQuizNo: number
}

/**
 * Stage별로 분배된 퀴즈 데이터
 */
export interface QuizStage {
  stage: number
  quizzes: ShuffledQuizItem[]
}

function isVocabularyActivity(activityType: ActivityType): boolean {
  return (
    activityType === ACTIVITY.VOCABULARY_1 ||
    activityType === ACTIVITY.VOCABULARY_2 ||
    activityType === ACTIVITY.VOCABULARY_3 ||
    activityType === ACTIVITY.VOCABULARY_4
  )
}

/**
 * Vocabulary 문제와 그 외 문제를 분리하는 함수
 */
function separateVocabularyQuizzes(quizzes: ShuffledQuizItem[]): {
  vocabulary: ShuffledQuizItem[]
  others: ShuffledQuizItem[]
} {
  const vocabulary: ShuffledQuizItem[] = []
  const others: ShuffledQuizItem[] = []

  quizzes.forEach((quiz) => {
    if (isVocabularyActivity(quiz.activityType)) {
      vocabulary.push(quiz)
    } else {
      others.push(quiz)
    }
  })

  return { vocabulary, others }
}

function groupVocabulary(
  vocabularyQuizzes: ShuffledQuizItem[],
  totalStages: number,
): ShuffledQuizItem[] {
  const ordered = [...vocabularyQuizzes].sort(
    (a, b) => a.originalQuizNo - b.originalQuizNo,
  )
  const groupSize = Math.floor(ordered.length / totalStages)
  const groups: ShuffledQuizItem[] = []

  for (let i = 0; i < ordered.length; i += groupSize) {
    const vocabularyGroup = ordered.slice(i, i + groupSize)

    groups.push({
      activityType: ordered[i].activityType,
      quizzes: vocabularyGroup.flatMap((item) => item.quizzes),
      originalQuizNo: ordered[i].originalQuizNo,
    })
  }

  return groups
}

/**
 * 액티비티 타입별로 그룹화하고 셔플하는 함수
 */
function groupAndShuffleByType(quizzes: ShuffledQuizItem[]): {
  shuffledGroups: Map<string, ShuffledQuizItem[]>
  shuffledTypeOrder: string[]
  typeIndices: Map<string, number>
} {
  const groupedByType = new Map<string, ShuffledQuizItem[]>()
  quizzes.forEach((quiz) => {
    const type = quiz.activityType
    if (!groupedByType.has(type)) {
      groupedByType.set(type, [])
    }
    groupedByType.get(type)!.push(quiz)
  })

  const shuffledGroups = new Map<string, ShuffledQuizItem[]>()
  groupedByType.forEach((items, type) => {
    shuffledGroups.set(
      type,
      isVocabularyActivity(type as ActivityType)
        ? [...items].sort((a, b) => a.originalQuizNo - b.originalQuizNo)
        : shuffle(items),
    )
  })

  const typeKeys = Array.from(shuffledGroups.keys())
  const shuffledTypeOrder = shuffle(typeKeys)
  const typeIndices = new Map<string, number>()
  typeKeys.forEach((key) => typeIndices.set(key, 0))

  return { shuffledGroups, shuffledTypeOrder, typeIndices }
}

/**
 * 라운드 로빈 방식으로 문제를 분산시키는 함수
 */
function distributeByRoundRobin(
  quizzes: ShuffledQuizItem[],
  maxItems?: number,
): ShuffledQuizItem[] {
  if (quizzes.length === 0) return []

  const { shuffledGroups, shuffledTypeOrder, typeIndices } =
    groupAndShuffleByType(quizzes)

  const distributed: ShuffledQuizItem[] = []
  const totalItems = maxItems ?? quizzes.length
  let distributedCount = 0
  const maxRounds = quizzes.length
  let currentRound = 0

  while (distributedCount < totalItems && currentRound < maxRounds) {
    for (const type of shuffledTypeOrder) {
      const items = shuffledGroups.get(type)!
      const currentIndex = typeIndices.get(type)!

      if (currentIndex < items.length) {
        distributed.push(items[currentIndex])
        typeIndices.set(type, currentIndex + 1)
        distributedCount++

        if (distributedCount >= totalItems) break
      }
    }
    currentRound++
  }

  return distributed
}

/**
 * 카드보카 레벨에서 Vocabulary를 각 Stage의 5라운드에 배치하는 함수
 * 각 Stage 구조: Round 1~4 (각 1문제씩, Vocabulary 제외) + Round 5 (Vocabulary 3개 압축)
 * Round 5에 Vocabulary 3개가 압축되어 1 Round로 처리됨
 * 따라서 1 Stage = 5 Round = 4문제 + Vocabulary 3개(압축) = 7개 아이템
 */
function distributeCardVocaLevel(
  quizzes: ShuffledQuizItem[],
  totalStages: number,
  bookLevel: string,
): ShuffledQuizItem[] {
  const { vocabulary, others } = separateVocabularyQuizzes(quizzes)

  // Vocabulary를 Stage 수만큼 묶기 (각 Stage의 Round 5에 사용)
  const vocabularyGroups = groupVocabulary(vocabulary, totalStages)

  // others 전체를 라운드 로빈으로 분산한 뒤, Stage별로 슬라이스 (같은 문제가 여러 Stage에 나오지 않도록)
  const distributedOthers = distributeByRoundRobin(others)

  const result: ShuffledQuizItem[] = []

  for (let stage = 1; stage <= totalStages; stage++) {
    // Round 1~4: 해당 Stage에 할당된 others만 슬라이스 (4문제씩)
    const startIdx = (stage - 1) * QUIZ_CONSTANTS.OTHERS_ROUNDS
    const endIdx = startIdx + QUIZ_CONSTANTS.OTHERS_ROUNDS
    const stageOthers = distributedOthers.slice(startIdx, endIdx)

    // Stage 문제들 합치기 (Round 1~4 + Round 5)
    result.push(...stageOthers, vocabularyGroups[stage - 1])
  }

  return result
}

/**
 * 같은 액티비티 타입이 연속으로 나오지 않도록 분산시키는 함수
 * 라운드 로빈 방식으로 각 액티비티 타입에서 하나씩 뽑아서 섞음
 */
function distributeActivityTypes(
  bookLevel: string,
  totalStages: number,
  quizzes: ShuffledQuizItem[],
  useCardVocaLayout: boolean,
): ShuffledQuizItem[] {
  if (quizzes.length === 0) return []

  if (useCardVocaLayout) {
    return distributeCardVocaLevel(quizzes, totalStages, bookLevel)
  }

  return distributeByRoundRobin(quizzes)
}

/**
 * ListeningActivity1용 변환
 * Examples 전체를 그대로 표시, Quiz와 매칭되는 항목은 병합, 나머지는 정답 아님(QuizNo: 0)
 * 결과: { QuizId, QuizNo, Question: { Text, Sound, Image } }[]
 */
function transformListeningActivity1(data: QuizData): QuizData {
  const { Quiz = [], Examples = [] } = data
  const examples = Examples as { Text?: string; Image?: string }[]

  if (!Array.isArray(examples) || examples.length === 0) {
    return { ...data, Quiz: [] }
  }

  const merged: BaseQuiz[] = examples.map((ex, idx) => {
    const matchingQuiz = Array.isArray(Quiz)
      ? Quiz.find((q) => q.Question?.Text === ex.Text)
      : null

    if (matchingQuiz) {
      return normalizeQuizToBase({
        ...matchingQuiz,
        Question: {
          ...matchingQuiz.Question,
          Text: ex.Text ?? '',
          Image: ex.Image ?? '',
          Sound: matchingQuiz.Question?.Sound ?? '',
        },
        Examples: [],
      })
    }

    return normalizeQuizToBase({
      QuizId: `distractor-${idx}`,
      QuizNo: 0,
      Question: { Text: ex.Text ?? '', Image: ex.Image ?? '', Sound: '' },
      Examples: [],
    })
  })

  return {
    ...data,
    Quiz: shuffle(merged),
  }
}

const LA2_MAX_CARDS = 6

/**
 * ListeningActivity2용 변환
 * 정답(Quiz 매칭)을 모두 포함하고, 최대 6개까지 표시
 * Examples 없으면 Quiz만 사용
 */
function transformListeningActivity2(data: QuizData): QuizData {
  const { Quiz = [], Examples = [] } = data
  const examples = Examples as { Text?: string }[]

  if (!Array.isArray(examples) || examples.length === 0) {
    const quizOnly = Array.isArray(Quiz)
      ? Quiz.map(normalizeQuizToBase).slice(0, LA2_MAX_CARDS)
      : []
    return { ...data, Quiz: shuffle(quizOnly) }
  }

  const correct: BaseQuiz[] = []
  const distractors: BaseQuiz[] = []

  examples.forEach((ex, idx) => {
    const matchingQuiz = Array.isArray(Quiz)
      ? Quiz.find((q) => q.Question?.Text === ex.Text)
      : null

    const item = matchingQuiz
      ? normalizeQuizToBase({
          ...matchingQuiz,
          Question: {
            ...matchingQuiz.Question,
            Text: ex.Text ?? '',
            Image: '',
            Sound: matchingQuiz.Question?.Sound ?? '',
          },
          Examples: [],
        })
      : normalizeQuizToBase({
          QuizId: `distractor-${idx}`,
          QuizNo: 0,
          Question: { Text: ex.Text ?? '', Image: '', Sound: '' },
          Examples: [],
        })

    if (matchingQuiz) {
      correct.push(item)
    } else {
      distractors.push(item)
    }
  })

  const distractorSlots = Math.max(0, LA2_MAX_CARDS - correct.length)
  const selectedDistractors = shuffle(distractors).slice(0, distractorSlots)
  const merged = shuffle([...correct, ...selectedDistractors])

  return { ...data, Quiz: merged }
}

/**
 * 특정 활동 타입에 대해 Quiz 배열을 셔플하는 함수
 * 모든 액티비티 타입에 대해 Quiz 배열이 있으면 셔플 적용
 * ListeningActivity1/2는 별도 변환 로직 적용
 * @param data 퀴즈 데이터 (Quiz 배열을 포함하는 객체)
 * @param activityType 액티비티 타입 (LA1/LA2 분기용)
 * @returns 셔플된 Quiz 배열이 적용된 데이터 또는 기본값
 */
function shuffleQuizIfNeeded(
  data: QuizData | null,
  activityType?: ActivityType,
): QuizData {
  if (!data || !Array.isArray(data.Quiz) || data.Quiz.length === 0) {
    return { Quiz: [] }
  }

  switch (activityType) {
    case ACTIVITY.LISTENING_1:
      return transformListeningActivity1(data)
    case ACTIVITY.LISTENING_2:
      return transformListeningActivity2(data)
    default:
      return {
        ...data,
        Quiz: (isVocabularyActivity(activityType as ActivityType)
          ? [...data.Quiz].sort((a, b) => a.QuizNo - b.QuizNo)
          : shuffle(data.Quiz)
        ).map(normalizeQuizToBase),
      }
  }
}

interface UseQuizManagerReturn {
  isLoading: boolean
  act1Data: QuizDataWithActivityType[]
  shuffledQuizStages: QuizStage[]
  activityTypes: ActivityType[]
}

/**
 * 모든 스텝의 퀴즈 데이터를 한번에 가져오는 hook
 * @param studyData 퀴즈 API용 최소 식별자 (IQuizStudyRef)
 * @param mappedStepActivity 각 스텝별 액티비티 타입 배열
 * @param bookLevel 책 레벨 정보
 * @returns 모든 퀴즈 데이터, Act1용 필터링 데이터, Quiz용 필터링 데이터, 로딩 상태, 에러 상태, 재조회 함수
 */
export function useQuizManager(studyData: IQuizStudyRef): UseQuizManagerReturn {
  const { studyInfo, bookInfo } = useContext(AppContext) as AppContextProps

  const [act1Data, setAct1Data] = useState<QuizDataWithActivityType[]>([])
  const [act2Data, setAct2Data] = useState<QuizDataWithActivityType[]>([])
  const [shuffledQuizStages, setShuffledQuizStages] = useState<QuizStage[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  /**
   * 액티비티 타입에 맞는 퀴즈 데이터 가져오는 함수
   */
  const getQuizDataByActivityType = useCallback(
    async (activityType: ActivityType): Promise<QuizData | null> => {
      const apiFunction = ACTIVITY_API_MAP[activityType]

      if (!apiFunction) {
        console.warn(`Unknown activity type: ${activityType}`, {
          allActivities: Object.values(ACTIVITY),
          received: activityType,
        })
        return null
      }

      return await apiFunction(studyData)
    },
    [studyData],
  )

  /**
   * 모든 퀴즈 데이터 가져오기
   */
  const fetchAllQuizData = useCallback(async () => {
    setIsLoading(true)

    try {
      const quizDataPromises = studyInfo.mappedStepActivity.map(
        async (
          activityType: ActivityType,
        ): Promise<QuizDataWithActivityType> => {
          try {
            const data = await getQuizDataByActivityType(activityType)
            const shuffledData = shuffleQuizIfNeeded(data, activityType)

            return {
              activityType,
              data: shuffledData,
            }
          } catch (err) {
            return {
              activityType,
              data: {
                Quiz: [],
              },
            }
          }
        },
      )
      const results = await Promise.all(quizDataPromises)

      // 레벨별 Act1 데이터 필터링
      const act1Data = filterQuizDataForAct1(results, bookInfo.BookLevel)
      setAct1Data(act1Data)

      // Act2 데이터 필터링
      const act2Data = filterQuizDataForAct2(results)
      setAct2Data(act2Data)

      // 전체 문제를 셔플하고 Stage별로 분배
      const stages = prepareShuffledQuizStages(act2Data, bookInfo.BookLevel)
      setShuffledQuizStages(stages)
    } catch (err) {
      // 에러 발생 시 모든 상태 초기화
      setAct1Data([])
      setAct2Data([])
      setShuffledQuizStages([])
      console.error('퀴즈 데이터 로딩 실패:', err)
    } finally {
      setIsLoading(false)
    }
  }, [
    studyInfo.mappedStepActivity,
    getQuizDataByActivityType,
    bookInfo.BookLevel,
  ])

  // 초기 로드
  useEffect(() => {
    if (
      studyInfo.mappedStepActivity &&
      studyInfo.mappedStepActivity.length > 0
    ) {
      fetchAllQuizData()
    }
  }, [fetchAllQuizData])

  // 이번 학습에서 진행되는 모든 액티비티 타입 (중복 제거)
  const activityTypes = useMemo<ActivityType[]>(() => {
    const types = act2Data.map((data) => data.activityType)
    return [...new Set(types)]
  }, [act2Data])

  return {
    isLoading,
    act1Data,
    shuffledQuizStages,
    activityTypes,
  }
}

/**
 * Act1에서 사용할 퀴즈 데이터 필터링 및 정렬
 * 레벨에 따라 다른 활동 타입 사용:
 * - K Level: Listening Activity만 포함
 * - 그 이상: Summary/True or False만 포함
 * Vocabulary는 제외하고 Quiz로 이동
 * @param allQuizData 모든 퀴즈 데이터
 * @param bookLevel 책 레벨 (예: "K", "1", "2" 등)
 * @returns 필터링 및 정렬된 퀴즈 데이터
 */
export function filterQuizDataForAct1(
  allQuizData: QuizDataWithActivityType[],
  bookLevel: string,
): QuizDataWithActivityType[] {
  let act1Activities: string[] = []

  if (LevelUtils.isKLevel(bookLevel)) {
    act1Activities = [
      ACTIVITY.LISTENING_1,
      ACTIVITY.LISTENING_2,
      ACTIVITY.SUMMARY_1,
    ]
  } else {
    // 그 이상 레벨일 때 포함할 액티비티 타입들
    act1Activities = [
      ACTIVITY.SUMMARY_1,
      ACTIVITY.SUMMARY_2,
      ACTIVITY.TRUE_OR_FALSE,
    ]
  }

  // filter를 사용하여 필터링 (원래 배열 순서 유지)
  return allQuizData.filter((quiz) =>
    act1Activities.includes(quiz.activityType),
  )
}

/**
 * Quiz에서 사용할 퀴즈 데이터 필터링
 * WritingActivity2와
 * Act1에서 사용되는 항목들
 * K Level - Listening Activity 1, Listening Activity 2
 * 그 이상 - SUMMARY_1, SUMMARY_2, TRUE_OR_FALSE 제외
 */
export function filterQuizDataForAct2(
  allQuizData: QuizDataWithActivityType[],
): QuizDataWithActivityType[] {
  return allQuizData.filter((quiz) => {
    const { activityType } = quiz

    if (
      // 제외 항목: WritingActivity2와 Act1에서 사용되는 항목들만 제외
      activityType === ACTIVITY.WRITING_2 ||
      activityType === ACTIVITY.LISTENING_1 ||
      activityType === ACTIVITY.LISTENING_2 ||
      activityType === ACTIVITY.SUMMARY_1 ||
      activityType === ACTIVITY.SUMMARY_2 ||
      activityType === ACTIVITY.TRUE_OR_FALSE
    ) {
      return false
    }

    return true
  })
}

/**
 * Quiz 데이터를 ShuffledQuizItem 배열로 변환하는 함수
 * @param quizQuizData Quiz에 사용할 퀴즈 데이터
 * @returns 변환된 ShuffledQuizItem 배열
 */
function convertQuizDataToItems(
  quizQuizData: QuizDataWithActivityType[],
): ShuffledQuizItem[] {
  const allQuizzes: ShuffledQuizItem[] = []

  quizQuizData.forEach(({ activityType, data }) => {
    if (data?.Quiz && Array.isArray(data.Quiz)) {
      data.Quiz.forEach((quiz) => {
        allQuizzes.push({
          activityType,
          quizzes: [quiz],
          originalQuizNo: quiz.QuizNo,
        })
      })
    }
  })

  return allQuizzes
}

/**
 * Stage별로 문제를 분배하는 함수
 * @param quizzes 셔플된 퀴즈 배열
 * @param totalStages 총 Stage 수
 * @param isKLevel K 레벨 여부
 * @returns Stage별로 분배된 퀴즈 데이터 배열
 */
function distributeToStages(
  quizzes: ShuffledQuizItem[],
  totalStages: number,
  isKLevel: boolean,
): QuizStage[] {
  const stages: QuizStage[] = []

  for (let stage = 1; stage <= totalStages; stage++) {
    let stageQuizzes: ShuffledQuizItem[]

    if (isKLevel) {
      // K 레벨은 전체 문제를 모두 포함
      stageQuizzes = quizzes
    } else {
      // 그 외 레벨은 각 Stage에 할당
      const startIndex = (stage - 1) * QUIZ_CONSTANTS.ROUNDS_PER_STAGE
      const endIndex = startIndex + QUIZ_CONSTANTS.ROUNDS_PER_STAGE
      stageQuizzes = quizzes.slice(startIndex, endIndex)
    }

    stages.push({
      stage,
      quizzes: stageQuizzes,
    })
  }

  return stages
}

/**
 * 전체 문제를 셔플하고 Stage별로 분배하는 함수
 * - 모든 액티비티 타입의 Quiz 배열을 하나로 합침
 * - 전체를 셔플하여 문제 번호와 퀴즈 타입이 섞이도록 함
 * - 레벨에 따라 Stage 수 결정:
 *   - K, 1 레벨: 1 stage (전체 문제 포함)
 *   - 2~3 레벨: 3 stage (각 5문제씩)
 *   - 4~6 레벨: 4 stage (각 5문제씩)
 * @param quizQuizData Quiz에 사용할 퀴즈 데이터
 * @param bookLevel 책 레벨 (예: "K", "1", "2", "3", "4", "5", "6" 등)
 * @returns Stage별로 분배된 퀴즈 데이터 배열
 */
export function prepareShuffledQuizStages(
  quizQuizData: QuizDataWithActivityType[],
  bookLevel: string,
): QuizStage[] {
  // 1. Quiz 데이터를 ShuffledQuizItem 배열로 변환
  const allQuizzes = convertQuizDataToItems(quizQuizData)

  // 2. 레벨에 따라 Stage 수 결정
  const totalStages = LevelUtils.getTotalStages(bookLevel)
  const isKLevel = LevelUtils.isKLevel(bookLevel)

  // Vocabulary3가 포함된 학습인지 여부 (카드보카 분배 적용 조건)
  const hasVocabulary3 = quizQuizData.some(
    ({ activityType }) => activityType === ACTIVITY.VOCABULARY_3,
  )

  // 3. 문제를 셔플하고 액티비티 타입 분산 (같은 타입이 연속으로 나오지 않도록)
  const shuffledQuizzes = distributeActivityTypes(
    bookLevel,
    totalStages,
    shuffle(allQuizzes),
    hasVocabulary3,
  )

  // 4. Stage별로 문제 분배
  return distributeToStages(shuffledQuizzes, totalStages, isKLevel)
}
