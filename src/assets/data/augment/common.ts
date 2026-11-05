import { AugmentContext } from '@hooks/study/remix/useAugmentManager'

/**
 * 증강 카테고리가 선택되어 있는지 확인하는 함수
 * @param context 증강 컨텍스트
 * @param category 증강 카테고리
 * @returns 증강 카테고리가 선택되어 있는지 확인하여 조건을 만족하면 true, 아니면 false
 */
export const commonCheckAugmentByCategory = (
  context: AugmentContext,
  category: string,
) => {
  return context.selectedAugments.some((a) => a.category === category)
}

/**
 * 특정 id를 제외하고 카테고리 선택 여부 확인
 * @param context 증강 컨텍스트
 * @param category 증강 카테고리
 * @param exceptIds 제외할 augment id 배열 (이 id들은 체크에서 제외)
 */
export const commonCheckAugmentByCategoryExcept = (
  context: AugmentContext,
  category: string,
  exceptIds: string[],
) => {
  const exceptSet = new Set(exceptIds)
  return context.selectedAugments.some(
    (a) => a.category === category && !exceptSet.has(a.id),
  )
}

/**
 * 증강 카테고리와 티어를 확인하는 함수
 * @param context 증강 컨텍스트
 * @param category 증강 카테고리
 * @param tier 증강 티어
 * @returns 증강 카테고리와 티어를 확인하여 조건을 만족하면 true, 아니면 false
 */
export const commonCheckAugmentByCategoryAndTier = (
  context: AugmentContext,
  category: string,
  tier: string,
) => {
  return context.selectedAugments.some(
    (a) => a.category === category && a.tier === tier,
  )
}

/**
 * 첫 스테이지인지 확인하는 함수
 * @param context 증강 컨텍스트
 * @returns 첫 스테이지인지 확인하여 조건을 만족하면 true, 아니면 false
 */
export const commonCheckIsFirstStage = (context: AugmentContext) => {
  return context.studyMode === 'Act1' && context.stage === 0
}

/**
 * 다음 스테이지가 마지막 스테이지인지 확인하는 함수
 * @param context
 * @returns 다음 스테이지가 마지막 스테이지인지 확인하여 조건을 만족하면 true, 아니면 false
 */
export const commonCheckIsLastStage = (context: AugmentContext) => {
  return (
    context.studyMode === 'Act2' && context.totalStage === context.stage + 1
  )
}

/**
 * 마지막 스테이지 직전(다음에 들어갈 스테이지가 마지막)인지 확인하는 함수
 * @param context
 * @returns 마지막 직전 스테이지 완료 시 true (증강 모달이 뜨는 시점과 일치)
 */
export const commonCheckIsBeforeLastStage = (context: AugmentContext) => {
  return (
    context.studyMode === 'Act2' && context.totalStage === context.stage + 2
  )
}

/**
 * 현재 시간과 총 시간의 차가 주어진 시간보다 더 흘렀는지 체크하는 함수. 즉, 시간이 초과되었는지 체크하는 함수
 * @param context 증강 컨텍스트
 * @param time 시간
 * @returns 현재 시간과 총 시간의 차가 주어진 시간보다 더 흘렀는지 체크하여 조건을 만족하면 true, 아니면 false
 */
export const commonCheckIsTimeExceeded = (
  context: AugmentContext,
  time: number,
) => {
  return context.initialTime - context.currentTime >= time
}

/**
 * 남은 시간이 주어진 시간보다 낮은지 확인하는 함수
 * @param context 증강 컨텍스트
 * @param time 시간
 * @returns 남은 시간이 주어진 시간보다 낮은지 확인하여 조건을 만족하면 true, 아니면 false
 */
export const commonCheckIsCurrentTimeLow = (
  context: AugmentContext,
  time: number,
) => {
  return context.currentTime <= time
}
